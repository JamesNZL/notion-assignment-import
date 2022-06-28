import { NotionClient, VALID_EMOJIS } from '../apis/notion';
import { Storage } from '../apis/storage';

import { SupportedTypes } from './configuration';
import { NullIfEmpty, NeverEmpty } from './';

import { Button, Input } from '../elements';

type TypeGuard = (value: unknown) => boolean;

export type ValidatorConstructor = new (elementId: string) => InputFieldValidator;

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
	private static validatingFields = new Set<string>();
	private static invalidFields = new Set<string>();

	private input: Input;
	protected typeGuard: TypeGuard;
	protected typeLabel: string;

	public constructor(elementId: string, typeGuard: TypeGuard, typeLabel: string) {
		this.input = Input.getInstance(elementId);
		this.typeGuard = typeGuard.bind(typeGuards);
		this.typeLabel = typeLabel;
	}

	public get id() {
		return this.input.id;
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

	public async validate(): Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT> {
		this.addValidatingStatus();

		const inputValue = this.input.getValue() ?? null;
		if (typeof inputValue === 'boolean') return inputValue;

		const validatedInput = await this.validator(inputValue);

		this.removeValidatingStatus();

		if (validatedInput !== InputFieldValidator.INVALID_INPUT) this.removeInvalidError();

		return validatedInput;
	}

	protected addValidatingStatus() {
		this.removeInvalidError();

		InputFieldValidator.validatingFields.add(this.id);

		const status = 'Validating input...';

		const statusElement = document.getElementById(`validating-input-${this.id}`);
		const statusHTML = `<span id='validating-input-${this.id}' class='validating-input-status'>${status}</span>`;

		if (!statusElement) this.input.insertAdjacentHTML('beforebegin', statusHTML);
		else statusElement.innerHTML = status;

		SaveButton.updateState(SaveButtonUpdates.Pending);
	}

	private removeValidatingStatus() {
		InputFieldValidator.validatingFields.delete(this.id);

		document.getElementById(`validating-input-${this.id}`)?.remove();

		SaveButton.updateState(SaveButtonUpdates.Restore);
	}

	protected addInvalidError(error: string) {
		InputFieldValidator.invalidFields.add(this.id);

		this.input.addClass('invalid-input');

		const errorElement = document.getElementById(`invalid-input-${this.id}`);
		const errorHTML = `<span id='invalid-input-${this.id}' class='invalid-input-error'>${error}</span>`;

		if (!errorElement) this.input.insertAdjacentHTML('beforebegin', errorHTML);
		else errorElement.innerHTML = error;

		SaveButton.updateState(SaveButtonUpdates.Disable);
	}

	private removeInvalidError() {
		InputFieldValidator.invalidFields.delete(this.id);

		this.input.removeClass('invalid-input');
		document.getElementById(`invalid-input-${this.id}`)?.remove();

		SaveButton.updateState(SaveButtonUpdates.Restore);
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

const typeGuards: Record<string, TypeGuard> = {
	isNullableString(value) {
		return (typeof value === 'string' || value === null);
	},
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
		super(elementId, typeGuards.isNullableString, 'string');
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

export class RequiredNotionDatabaseIdField extends RequiredField {
	public constructor(elementId: string) {
		super(elementId, typeGuards.isString, 'string');
	}

	protected override async validator(inputValue: NullIfEmpty<string>): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		try {
			if (await super.validator(inputValue) !== inputValue) return InputFieldValidator.INVALID_INPUT;

			const { accessToken } = await Storage.getNotionAuthorisation();
			const notionClient = NotionClient.getInstance({ auth: accessToken ?? '' });

			if (!accessToken || !await notionClient.validateToken()) throw 'Invalid Notion Integration Key.';

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
		super(elementId, typeGuards.isNullableString, 'string');
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