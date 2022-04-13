import { NotionClient } from '../api-handlers/notion';
import { NullIfEmpty, NeverEmpty } from './';

type TypeGuard = (value: unknown) => boolean;

export type ValidatorConstructor = new (elementId: string, inputValue: NullIfEmpty<string>) => FieldValidator;

export abstract class FieldValidator {
	public static readonly INVALID_INPUT: unique symbol = Symbol('INVALID_INPUT');
	private static readonly saveButton = document.getElementById('save-button');
	private static invalidFields = new Set<string>();

	protected elementId: string;
	protected inputValue: NullIfEmpty<string>;
	protected typeGuard: TypeGuard;
	protected type: string;

	public constructor(elementId: string, inputValue: NullIfEmpty<string>, typeGuard: TypeGuard, type: string) {
		this.elementId = elementId;
		this.inputValue = inputValue;
		this.typeGuard = typeGuard;
		this.type = type;
	}

	protected async validator(): Promise<NullIfEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		if (this.typeGuard(this.inputValue)) return this.inputValue;
		else {
			this.addInvalidError(`Input must be a ${this.type}!`);
			return FieldValidator.INVALID_INPUT;
		}
	}

	public async validate(): Promise<NullIfEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		const validatedInput = await this.validator();

		if (validatedInput !== FieldValidator.INVALID_INPUT) this.removeInvalidError();

		return validatedInput;
	}

	protected addInvalidError(error: string) {
		FieldValidator.invalidFields.add(this.elementId);

		const fieldElement = document.getElementById(this.elementId);

		if (fieldElement) {
			fieldElement.classList.add('invalid-input');

			const errorElement = document.getElementById(`invalid-input-${this.elementId}`);
			const errorHTML = `<span id='invalid-input-${this.elementId}' class='invalid-input-error'>${error}</span>`;

			if (!errorElement) fieldElement.insertAdjacentHTML('beforebegin', errorHTML);
			else errorElement.innerHTML = errorHTML;
		}

		FieldValidator.disableSaveButton();
	}

	private removeInvalidError() {
		FieldValidator.invalidFields.delete(this.elementId);

		document.getElementById(this.elementId)?.classList.remove('invalid-input');
		document.getElementById(`invalid-input-${this.elementId}`)?.remove();

		FieldValidator.restoreSaveButton();
	}

	private static disableSaveButton() {
		if (FieldValidator.saveButton && FieldValidator.saveButton instanceof HTMLButtonElement) {
			FieldValidator.saveButton.innerHTML = `${FieldValidator.invalidFields.size} invalid input${(FieldValidator.invalidFields.size > 1) ? 's' : ''}!`;
			FieldValidator.saveButton.disabled = true;
			FieldValidator.saveButton.classList.add('red');
			FieldValidator.saveButton.classList.remove('green');
		}
	}

	private static restoreSaveButton() {
		if (FieldValidator.invalidFields.size > 0) return FieldValidator.disableSaveButton();

		if (FieldValidator.saveButton && FieldValidator.saveButton instanceof HTMLButtonElement) {
			FieldValidator.saveButton.innerHTML = 'Save';
			FieldValidator.saveButton.disabled = false;
			FieldValidator.saveButton.classList.add('green');
			FieldValidator.saveButton.classList.remove('red');
		}
	}
}

abstract class RequiredField extends FieldValidator {
	protected override async validator(): Promise<NeverEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		if (this.inputValue) {
			if (this.typeGuard(this.inputValue)) return this.inputValue;
			else this.addInvalidError(`Input must be a ${this.type}!`);
		}
		else this.addInvalidError('Input field cannot be empty!');

		return FieldValidator.INVALID_INPUT;
	}
}

abstract class JSONObjectField extends FieldValidator {
	protected override async validator(): Promise<NeverEmpty<string> | '{}' | typeof FieldValidator.INVALID_INPUT> {
		try {
			if (!this.inputValue) return '{}';

			const parsed = JSON.parse(this.inputValue);

			// JSON can't serialise any non-primitives other than 'objects' and arrays, so this will do
			if (parsed instanceof Object && !Array.isArray(parsed)) {
				if (Object.values(parsed).every(this.typeGuard)) {
					document.getElementById(this.elementId)?.classList?.remove('invalid-input');
					return this.inputValue;
				}
				else this.addInvalidError(`All object values must be ${this.type}s!`);
			}
			else this.addInvalidError('Input must be an object <code>{}</code>.');

			return FieldValidator.INVALID_INPUT;
		}
		catch {
			this.addInvalidError('Input is not valid <code>JSON</code>.');
			return FieldValidator.INVALID_INPUT;
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
		const emojiRegExp = /^[\p{Emoji_Presentation}\u200D]+$/u;
		return (typeof value === 'string' && emojiRegExp.test(value));
	},
};

export class StringField extends FieldValidator {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isNullableString, 'string');
	}
}

export class RequiredStringField extends RequiredField {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}
}

export class RequiredNumberField extends RequiredField {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isParsableNumber, 'number');
	}
}

export class RequiredNotionKeyField extends RequiredField {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}

	protected override async validator(): Promise<NeverEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		if (this.inputValue) {
			if (this.typeGuard(this.inputValue)) {
				const notionClient = new NotionClient({ auth: this.inputValue });
				if (await notionClient.retrieveMe()) return this.inputValue;
				else this.addInvalidError('Input is not a valid Notion Integration Key.');
			}
			else this.addInvalidError(`Input must be a ${this.type}!`);
		}
		else this.addInvalidError('Input field cannot be empty!');

		return FieldValidator.INVALID_INPUT;
	}
}

export class JSONStringObjectField extends JSONObjectField {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}
}

export class JSONEmojiObjectField extends JSONObjectField {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isEmojiRequest, 'emoji');
	}
}