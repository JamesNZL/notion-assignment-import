import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';

import { SupportedTypes, CONFIGURATION } from './configuration';

import { Element, Button, Input } from '../elements';

import { VALID_EMOJIS, VALID_TIME_ZONES } from '../types/notion';
import { NullIfEmpty, NeverEmpty } from '../types/storage';

type TypeGuard = (value: unknown) => boolean;

export type ValidatorConstructor = new (elementId: string) => InputFieldValidator;

interface CoupledValidator {
	readonly validator: InputFieldValidator;
	readonly propagateInvalidClass: boolean;
	readonly propagateError: boolean;
}

const enum SaveButtonUpdates {
	Pending,
	Disable,
	Restore,
}

const SaveButton: {
	button?: Button;
	updateState(update: SaveButtonUpdates): void;
} = <const>{
	get button() {
		try {
			delete this.button;
			return this.button = Button.getInstance({ id: 'save-button' });
		}
		catch { null; }
	},
	updateState(update: SaveButtonUpdates): void {
		if (!this.button) return;
		switch (update) {
			case (SaveButtonUpdates.Pending): {
				this.button.setButtonLabel(`Validating ${InputFieldValidator.countValidatingFields()} input${(InputFieldValidator.countValidatingFields() > 1) ? 's' : ''}...`);
				this.button.disable();
				break;
			}
			case (SaveButtonUpdates.Disable): {
				this.button.setButtonLabel(`${InputFieldValidator.countInvalidFields()} invalid input${(InputFieldValidator.countInvalidFields() > 1) ? 's' : ''}!`);
				this.button.disable();
				this.button.addClass('red');
				this.button.removeClass('green');
				break;
			}
			case (SaveButtonUpdates.Restore): {
				if (InputFieldValidator.countInvalidFields() > 0) return this.updateState(SaveButtonUpdates.Disable);
				else if (InputFieldValidator.countValidatingFields() > 0) return this.updateState(SaveButtonUpdates.Pending);

				this.button.resetHTML();
				this.button.enable();
				break;
			}
		}
	},
};

export abstract class InputFieldValidator {
	public static readonly INVALID_INPUT: unique symbol = Symbol('INVALID_INPUT');
	public static validatingFields = new Set<string>();
	public static invalidFields = new Set<string>();

	private input: Input;
	protected typeGuard: TypeGuard;
	protected typeLabel: string;

	private statusElement?: Element;
	private errorElement?: Element;

	private coupledValidators: CoupledValidator[] = [];

	public constructor(elementId: string, typeGuard: TypeGuard, typeLabel: string) {
		this.input = Input.getInstance({ id: elementId });
		this.typeGuard = typeGuard.bind(typeGuards);
		this.typeLabel = typeLabel;
	}

	public get id() {
		return this.input.id;
	}

	public coupleTo(validator: InputFieldValidator, {
		propagateInvalidClass = true,
		propagateError = true,
	}) {
		this.coupledValidators.push({
			validator,
			propagateInvalidClass,
			propagateError,
		});

		validator.coupledValidators.push({
			validator: this,
			propagateInvalidClass,
			propagateError,
		});
	}

	public static countValidatingFields() {
		return InputFieldValidator.validatingFields.size;
	}

	public static countInvalidFields() {
		return InputFieldValidator.invalidFields.size;
	}

	protected async validator(inputValue: NullIfEmpty<string>): Promise<NullIfEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		if (this.typeGuard(inputValue)) return inputValue;

		this.addInvalidError(`Input must be ${this.typeLabel}!`);
		return InputFieldValidator.INVALID_INPUT;
	}

	public async validate(isTarget = true): Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT> {
		if (isTarget) this.addValidatingStatus();

		const inputValue = this.input.getValue() ?? null;
		if (typeof inputValue === 'boolean') return inputValue;

		const validatedInput = await this.validator(inputValue);

		if (!isTarget) return validatedInput;

		this.removeValidatingStatus();

		if (!this.coupledValidators.length) return validatedInput;

		const anyCoupledInvalid = [
			validatedInput,
			...(await Promise.all(
				this.coupledValidators.map(({ validator }) => validator.validate(false)),
			)),
		]
			.includes(InputFieldValidator.INVALID_INPUT);

		if (!anyCoupledInvalid) this.removeInvalidError();

		return validatedInput;
	}

	protected addValidatingStatus(isTarget = true) {
		this.removeInvalidError();

		InputFieldValidator.validatingFields.add(this.id);

		const status = 'Validating input...';

		if (!this.statusElement) {
			const element = document.createElement('span');

			element.setAttribute('id', `validating-input-${this.id}`);
			element.classList.add('validating-input-status');

			this.input.insertAdjacentElement('beforebegin', element);

			this.statusElement = Element.getInstance({
				id: `validating-input-${this.id}`,
				type: 'validator label',
			});
		}

		this.statusElement.safelySetInnerHTML(status);
		if (this.input.isSelfHidden) this.statusElement.hide();

		SaveButton.updateState(SaveButtonUpdates.Pending);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator }) => validator.addValidatingStatus(false));
	}

	private removeValidatingStatus(isTarget = true) {
		InputFieldValidator.validatingFields.delete(this.id);

		this.statusElement?.remove();
		this.statusElement = undefined;

		SaveButton.updateState(SaveButtonUpdates.Restore);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator }) => validator.removeValidatingStatus(false));
	}

	protected addInvalidError(error: string, isTarget = true, addInvalidClass = true) {
		if (addInvalidClass) {
			InputFieldValidator.invalidFields.add(this.id);
			this.input.addClass('invalid-input');
		}

		if (!this.errorElement) {
			const element = document.createElement('span');

			element.setAttribute('id', `invalid-input-${this.id}`);
			element.classList.add('invalid-input-error');

			this.input.insertAdjacentElement('beforebegin', element);

			this.errorElement = Element.getInstance({
				id: `invalid-input-${this.id}`,
				type: 'validator label',
			});
		}

		this.errorElement.safelySetInnerHTML(error);
		if (this.input.isSelfHidden) this.errorElement.hide();

		SaveButton.updateState(SaveButtonUpdates.Disable);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator, propagateInvalidClass, propagateError }) => validator.addInvalidError((propagateError) ? error : String.fromCharCode(0x00A0), false, propagateInvalidClass));
	}

	private removeInvalidError(isTarget = true, removeInvalidClass = true) {
		if (removeInvalidClass) {
			InputFieldValidator.invalidFields.delete(this.id);
			this.input.removeClass('invalid-input');
		}

		this.errorElement?.remove();
		this.errorElement = undefined;

		SaveButton.updateState(SaveButtonUpdates.Restore);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator, propagateInvalidClass }) => validator.removeInvalidError(false, propagateInvalidClass));
	}
}

abstract class RequiredField extends InputFieldValidator {
	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		try {
			if (!inputValue) throw 'Required field cannot be empty!';

			if (!this.typeGuard(inputValue)) throw `Input must be ${this.typeLabel}!`;

			return inputValue;
		}
		catch (error: unknown) {
			if (typeof error === 'string') this.addInvalidError(error);
			return InputFieldValidator.INVALID_INPUT;
		}
	}
}

abstract class JSONObjectField extends InputFieldValidator {
	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NeverEmpty<string> | '{}' | typeof InputFieldValidator.INVALID_INPUT> {
		try {
			if (!inputValue) return '{}';

			const parsed = JSON.parse(inputValue);

			// JSON can't serialise any non-primitives other than 'objects' and arrays, so this will do
			if (!(parsed instanceof Object) || Array.isArray(parsed)) throw 'Input must be an object <code>{}</code>.';

			// this also fails-fast, just like .some(!this.typeGuard)
			if (!Object.values(parsed).every(this.typeGuard)) throw `Every object value must be ${this.typeLabel}!`;

			return inputValue;
		}
		catch (error: unknown) {
			(typeof error === 'string')
				? this.addInvalidError(error)
				: this.addInvalidError('Input is not valid <code>JSON</code>.');

			return InputFieldValidator.INVALID_INPUT;
		}
	}
}

const typeGuardModifiers = <const>{
	isNullable(typeGuard: TypeGuard) {
		return (value: unknown) => typeGuard(value) || value === null;
	},
};

export const typeGuards = <const>{
	isString(value: unknown): value is string {
		return (typeof value === 'string');
	},
	isParsableNumber(value: unknown): value is string {
		return (typeof value === 'string' && !isNaN(Number(value)));
	},
	isEmojiRequest(value: unknown): value is string {
		return (typeof value === 'string' && (<string[]>VALID_EMOJIS).includes(value));
	},
	isTimeZoneRequest(value: unknown): value is string {
		return (typeof value === 'string' && (<string[]>VALID_TIME_ZONES).includes(value));
	},
	isUUIDv4(value: unknown): value is string {
		// allow hyphens to be optional as the Notion API doesn't require them
		// also, Notion URLs don't have them, so it wouldn't be very user friendly to require them
		const hyphenatedRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;
		const nonHyphenatedRegex = /^[0-9Aa-f-F]{8}[0-9a-fA-F]{4}[0-9a-fA-F]{4}[89AB][0-9a-fA-F]{3}[0-9a-fA-F]{12}$/i;

		return (typeof value === 'string') && [hyphenatedRegex, nonHyphenatedRegex].some(regex => regex.test(value));
	},
};

export class StringField extends InputFieldValidator {
	public constructor(elementId: string) {
		super(elementId, typeGuardModifiers.isNullable(typeGuards.isString), 'a string');
	}
}

export class EmojiField extends InputFieldValidator {
	public constructor(elementId: string) {
		super(elementId, typeGuardModifiers.isNullable(typeGuards.isEmojiRequest), 'an emoji');
	}
}

export class TimeZoneField extends InputFieldValidator {
	public constructor(elementId: string) {
		super(elementId, typeGuardModifiers.isNullable(typeGuards.isTimeZoneRequest), 'a timezone');
	}
	
	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NullIfEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		if (await super.validator(inputValue) !== inputValue) {
			this.addInvalidError('Invalid time zone.');
			return InputFieldValidator.INVALID_INPUT;
		}
		return inputValue;
	}
}

export class RequiredStringField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isString, 'a string');
	}
}

export class RequiredNumberAsStringField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isParsableNumber, 'a number');
	}
}

export class RequiredNotionTokenField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isString, 'a string');
	}

	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		try {
			if (await super.validator(inputValue) !== inputValue) return InputFieldValidator.INVALID_INPUT;

			if (!navigator.onLine) throw 'Please connect to the Internet to validate this input.';

			const notionClient = NotionClient.getInstance({ auth: inputValue });

			if (!await notionClient.validateToken()) throw 'Input is not a valid Notion Integration Token.';

			return inputValue;
		}
		catch (error: unknown) {
			if (typeof error === 'string') this.addInvalidError(error);
			return InputFieldValidator.INVALID_INPUT;
		}
	}
}

export class RequiredNotionDatabaseIdField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isUUIDv4, 'a valid database ID');
	}

	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		try {
			if (await super.validator(inputValue) !== inputValue) return InputFieldValidator.INVALID_INPUT;

			const accessToken = (await Storage.getNotionAuthorisation()).accessToken ?? CONFIGURATION.FIELDS['notion.accessToken'].input.getValue();

			const notionClient = NotionClient.getInstance({ auth: String(accessToken) });

			if (!accessToken || !await notionClient.validateToken()) throw 'Invalid Notion Integration Token.';

			if (!navigator.onLine) throw 'Please connect to the Internet to validate this input.';

			if (!await notionClient.retrieveDatabase(inputValue, { cache: true, force: true })) throw 'Could not find the database.<br>Verify the ID and make sure the database is shared with your integration.';

			return inputValue;
		}
		catch (error: unknown) {
			if (typeof error === 'string') this.addInvalidError(error);
			return InputFieldValidator.INVALID_INPUT;
		}
	}
}

export class JSONStringObjectField extends JSONObjectField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isString, 'a string');
	}
}

export class JSONEmojiObjectField extends JSONObjectField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isEmojiRequest, 'an emoji');
	}
}
