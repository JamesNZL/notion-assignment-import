import { NotionClient } from '../api-handlers/notion';
import { NullIfEmpty, NeverEmpty } from './';
import { CONFIGURATION } from './configuration';

type TypeGuard = (value: unknown) => boolean;

export type ValidatorConstructor = new (elementId: string, inputValue: NullIfEmpty<string>) => FieldValidator;

const enum SaveButtonUpdates {
	Pending,
	Disable,
	Restore,
}

const SaveButton = {
	button: document.getElementById('save-button'),
	updateState(update: SaveButtonUpdates): void {
		if (this.button && this.button instanceof HTMLButtonElement) {
			switch (update) {
				case SaveButtonUpdates.Pending:
					this.button.innerHTML = `Validating ${FieldValidator.countValidatingFields()} input${(FieldValidator.countValidatingFields() > 1) ? 's' : ''}...`;
					this.button.disabled = true;
					break;
				case SaveButtonUpdates.Disable:
					this.button.innerHTML = `${FieldValidator.countInvalidFields()} invalid input${(FieldValidator.countInvalidFields() > 1) ? 's' : ''}!`;
					this.button.disabled = true;
					this.button.classList.add('red');
					this.button.classList.remove('green');
					break;
				case SaveButtonUpdates.Restore:
					if (FieldValidator.countInvalidFields() > 0) return this.updateState(SaveButtonUpdates.Disable);
					else if (FieldValidator.countValidatingFields() > 0) return this.updateState(SaveButtonUpdates.Pending);

					this.button.innerHTML = 'Save';
					this.button.disabled = false;
					this.button.classList.add('green');
					this.button.classList.remove('red');
					break;
			}
		}
	},
};

export abstract class FieldValidator {
	public static readonly INVALID_INPUT: unique symbol = Symbol('INVALID_INPUT');
	private static validatingFields = new Set<string>();
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

	public static countValidatingFields(): number {
		return FieldValidator.validatingFields.size;
	}

	public static countInvalidFields(): number {
		return FieldValidator.invalidFields.size;
	}

	protected async validator(): Promise<NullIfEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		if (this.typeGuard(this.inputValue)) return this.inputValue;
		else {
			this.addInvalidError(`Input must be a ${this.type}!`);
			return FieldValidator.INVALID_INPUT;
		}
	}

	public async validate(): Promise<NullIfEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		this.addValidatingStatus();
		const validatedInput = await this.validator();
		this.removeValidatingStatus();

		if (validatedInput !== FieldValidator.INVALID_INPUT) this.removeInvalidError();

		return validatedInput;
	}

	protected addValidatingStatus() {
		this.removeInvalidError();

		FieldValidator.validatingFields.add(this.elementId);

		const fieldElement = document.getElementById(this.elementId);

		if (fieldElement) {
			const statusElement = document.getElementById(`validating-input-${this.elementId}`);
			const statusHTML = `<span id='validating-input-${this.elementId}' class='validating-input-status'>Validating input...</span>`;

			if (!statusElement) fieldElement.insertAdjacentHTML('beforebegin', statusHTML);
			else statusElement.innerHTML = statusHTML;
		}

		SaveButton.updateState(SaveButtonUpdates.Pending);
	}

	private removeValidatingStatus() {
		FieldValidator.validatingFields.delete(this.elementId);

		document.getElementById(`validating-input-${this.elementId}`)?.remove();

		SaveButton.updateState(SaveButtonUpdates.Restore);
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

		SaveButton.updateState(SaveButtonUpdates.Disable);
	}

	private removeInvalidError() {
		FieldValidator.invalidFields.delete(this.elementId);

		document.getElementById(this.elementId)?.classList.remove('invalid-input');
		document.getElementById(`invalid-input-${this.elementId}`)?.remove();

		SaveButton.updateState(SaveButtonUpdates.Restore);
	}
}

abstract class RequiredField extends FieldValidator {
	protected override async validator(): Promise<NeverEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		if (this.inputValue) {
			if (this.typeGuard(this.inputValue)) return this.inputValue;
			else this.addInvalidError(`Input must be a ${this.type}!`);
		}
		else this.addInvalidError('Required field cannot be empty!');

		return FieldValidator.INVALID_INPUT;
	}
}

abstract class RequiredFieldCache extends RequiredField {
	protected static cache: Record<string, NeverEmpty<string>> = {};

	public getCachedInput(): NeverEmpty<string> {
		return RequiredFieldCache.cache[this.elementId];
	}

	protected cacheInput<T extends NeverEmpty<string>>(inputValue: T): T {
		if (this.inputValue) RequiredFieldCache.cache[this.elementId] = inputValue;
		return inputValue;
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

export class RequiredNotionKeyField extends RequiredFieldCache {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}

	protected override async validator(): Promise<NeverEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		// check the cache first
		if (this.getCachedInput() === this.inputValue) return this.inputValue;

		if (await super.validator() === this.inputValue) {
			if (navigator.onLine) {
				const notionClient = new NotionClient({ auth: this.inputValue });
				if (await notionClient.retrieveMe()) return this.cacheInput(this.inputValue);
				else this.addInvalidError('Input is not a valid Notion Integration Key.');
			}
			else this.addInvalidError('Please connect to the Internet to validate this input.');
		}
		return FieldValidator.INVALID_INPUT;
	}
}

export class RequiredNotionDatabaseIdField extends RequiredFieldCache {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}

	private async getNotionKey(): Promise<NeverEmpty<string> | null> {
		const keyConfiguration = CONFIGURATION.FIELDS['notion.notionKey'];

		const keyFieldElement = document.getElementById(keyConfiguration.elementId);

		if (keyFieldElement && (keyFieldElement instanceof HTMLInputElement || keyFieldElement instanceof HTMLTextAreaElement)) {
			const keyInput = keyFieldElement.value.trim() || null;

			if (keyInput) {
				const keyValidator = new keyConfiguration.Validator(keyConfiguration.elementId, keyInput);

				// if the keyInput has been cached by RequiredNotionKeyField, just return it without validating again
				if (keyValidator instanceof RequiredFieldCache && keyValidator.getCachedInput() === keyInput) return keyInput;

				const validatedKey = await new keyConfiguration.Validator(keyConfiguration.elementId, keyInput).validate();
				if (validatedKey !== FieldValidator.INVALID_INPUT) return validatedKey;
			}
		}

		return null;
	}

	protected override async validator(): Promise<NeverEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		// check the cache first
		if (this.getCachedInput() === this.inputValue) return this.inputValue;

		if (await super.validator() === this.inputValue) {
			const notionKey = await this.getNotionKey();
			if (notionKey) {
				if (navigator.onLine) {
					const notionClient = new NotionClient({ auth: notionKey });
					if (await notionClient.retrieveDatabase(this.inputValue)) return this.cacheInput(this.inputValue);
					else this.addInvalidError('Could not find the database.<br>Verify the ID and make sure the database is shared with your integration.');
				}
				else this.addInvalidError('Please connect to the Internet to validate this input.');
			}
			else this.addInvalidError('Invalid Notion Integration Key.');
		}
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

export class TimeZoneField extends FieldValidator {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isNullableString, 'string');
	}

	protected override async validator(): Promise<NullIfEmpty<string> | typeof FieldValidator.INVALID_INPUT> {
		if (!this.inputValue) return null;

		if (await super.validator() === this.inputValue) {
			try {
				Intl.DateTimeFormat(undefined, { timeZone: this.inputValue });
				return this.inputValue;
			}
			catch {
				this.addInvalidError('Invalid time zone.');
			}
		}
		return FieldValidator.INVALID_INPUT;
	}
}