import { NotionClient, VALID_EMOJIS } from '../apis/notion';
import { Storage } from '../apis/storage';

import { SupportedTypes, CONFIGURATION } from './configuration';
import { NullIfEmpty, NeverEmpty } from './';

import { Element, Button, Input } from '../elements';

type TypeGuard = (value: unknown) => boolean;
type TypeGuardModifier = (typeGuard: TypeGuard) => TypeGuard;

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
			return this.button = Button.getInstance('save-button');
		}
		catch { null; }
	},
	updateState(update: SaveButtonUpdates): void {
		if (!this.button) return;
		switch (update) {
			case SaveButtonUpdates.Pending:
				this.button.setButtonLabel(`Validating ${InputFieldValidator.countValidatingFields()} input${(InputFieldValidator.countValidatingFields() > 1) ? 's' : ''}...`);
				this.button.disable();
				break;
			case SaveButtonUpdates.Disable:
				this.button.setButtonLabel(`${InputFieldValidator.countInvalidFields()} invalid input${(InputFieldValidator.countInvalidFields() > 1) ? 's' : ''}!`);
				this.button.disable();
				this.button.addClass('red');
				this.button.removeClass('green');
				break;
			case SaveButtonUpdates.Restore:
				if (InputFieldValidator.countInvalidFields() > 0) return this.updateState(SaveButtonUpdates.Disable);
				else if (InputFieldValidator.countValidatingFields() > 0) return this.updateState(SaveButtonUpdates.Pending);

				this.button.resetHTML();
				this.button.enable();
				break;
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

	private coupledValidators: CoupledValidator[] = [];

	public constructor(elementId: string, typeGuard: TypeGuard, typeLabel: string) {
		this.input = Input.getInstance(elementId);
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

		this.addInvalidError(`Input must be a ${this.typeLabel}!`);
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

		try {
			const statusElement = Element.getInstance(`validating-input-${this.id}`, 'validator label');

			statusElement.safelySetInnerHTML(status);
		}
		catch {
			const statusElement = document.createElement('span');

			statusElement.setAttribute('id', `validating-input-${this.id}`);
			statusElement.classList.add('validating-input-status');
			statusElement.textContent = status;

			this.input.insertAdjacentElement('beforebegin', statusElement);
		}

		SaveButton.updateState(SaveButtonUpdates.Pending);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator }) => validator.addValidatingStatus(false));
	}

	private removeValidatingStatus(isTarget = true) {
		InputFieldValidator.validatingFields.delete(this.id);

		try {
			Element.getInstance(`validating-input-${this.id}`, 'validator label').remove();
		}
		catch { null; }

		SaveButton.updateState(SaveButtonUpdates.Restore);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator }) => validator.removeValidatingStatus(false));
	}

	protected addInvalidError(error: string, isTarget = true, addInvalidClass = true) {
		if (addInvalidClass) {
			InputFieldValidator.invalidFields.add(this.id);
			this.input.addClass('invalid-input');
		}

		try {
			const errorElement = Element.getInstance(`invalid-input-${this.id}`, 'validator label');

			errorElement.safelySetInnerHTML(error);
		}
		catch {
			const errorElement = document.createElement('span');

			errorElement.setAttribute('id', `invalid-input-${this.id}`);
			errorElement.classList.add('invalid-input-error');
			errorElement.textContent = error;

			this.input.insertAdjacentElement('beforebegin', errorElement);
		}

		SaveButton.updateState(SaveButtonUpdates.Disable);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator, propagateInvalidClass, propagateError }) => validator.addInvalidError((propagateError) ? error : String.fromCharCode(0x00A0), false, propagateInvalidClass));
	}

	private removeInvalidError(isTarget = true, removeInvalidClass = true) {
		if (removeInvalidClass) {
			InputFieldValidator.invalidFields.delete(this.id);
			this.input.removeClass('invalid-input');
		}

		try {
			Element.getInstance(`invalid-input-${this.id}`, 'validator label').remove();
		}
		catch { null; }

		SaveButton.updateState(SaveButtonUpdates.Restore);

		if (!isTarget) return;

		this.coupledValidators.forEach(({ validator, propagateInvalidClass }) => validator.removeInvalidError(false, propagateInvalidClass));
	}
}

abstract class RequiredField extends InputFieldValidator {
	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		try {
			if (!inputValue) throw 'Required field cannot be empty!';

			if (!this.typeGuard(inputValue)) throw `Input must be a ${this.typeLabel}!`;

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
			if (!Object.values(parsed).every(this.typeGuard)) throw `All object values must be ${this.typeLabel}s!`;

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

const typeGuardModifiers: Record<string, TypeGuardModifier> = <const>{
	isNullable(typeGuard) {
		return value => typeGuard(value) || value === null;
	},
};

const typeGuards: Record<string, TypeGuard> = <const>{
	isString(value) {
		return (typeof value === 'string');
	},
	isParsableNumber(value) {
		return (typeof value === 'string' && !isNaN(Number(value)));
	},
	isEmojiRequest(value) {
		return (typeof value === 'string' && (<string[]>VALID_EMOJIS).includes(value));
	},
};

export class StringField extends InputFieldValidator {
	public constructor(elementId: string) {
		super(elementId, typeGuardModifiers.isNullable(typeGuards.isString), 'string');
	}
}

export class EmojiField extends InputFieldValidator {
	public constructor(elementId: string) {
		super(elementId, typeGuardModifiers.isNullable(typeGuards.isEmojiRequest), 'emoji');
	}
}

export class RequiredStringField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isString, 'string');
	}
}

export class RequiredNumberAsStringField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isParsableNumber, 'number');
	}
}

export class RequiredNotionTokenField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isString, 'string');
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
		super(elementId, typeGuards.isString, 'string');
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
		super(elementId, typeGuards.isString, 'string');
	}
}

export class JSONEmojiObjectField extends JSONObjectField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isEmojiRequest, 'emoji');
	}
}

export class TimeZoneField extends InputFieldValidator {
	public constructor(elementId: string) {
		super(elementId, typeGuardModifiers.isNullable(typeGuards.isString), 'string');
	}

	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NullIfEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		if (!inputValue) return null;

		if (await super.validator(inputValue) !== inputValue) return InputFieldValidator.INVALID_INPUT;

		try {
			Intl.DateTimeFormat(undefined, { timeZone: inputValue });
			return inputValue;
		}
		catch {
			this.addInvalidError('Invalid time zone.');
			return InputFieldValidator.INVALID_INPUT;
		}
	}
}