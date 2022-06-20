import { NotionClient, VALID_EMOJIS } from '../api-handlers/notion';

import { NullIfEmpty, NeverEmpty } from './';
import { CONFIGURATION } from './configuration';

import { Button } from '../elements';

type TypeGuard = (value: unknown) => boolean;

export type ValidatorConstructor = new (elementId: string, inputValue: NullIfEmpty<string>) => InputFieldValidator;

const enum SaveButtonUpdates {
	Pending,
	Disable,
	Restore,
}

const SaveButton = {
	button: new Button('save-button'),
	updateState(update: SaveButtonUpdates): void {
		switch (update) {
			case SaveButtonUpdates.Pending:
				this.button.setLabel(`Validating ${InputFieldValidator.countValidatingFields()} input${(InputFieldValidator.countValidatingFields() > 1) ? 's' : ''}...`);
				this.button.disable();
				break;
			case SaveButtonUpdates.Disable:
				console.log(this.button);
				this.button.setLabel(`${InputFieldValidator.countInvalidFields()} invalid input${(InputFieldValidator.countInvalidFields() > 1) ? 's' : ''}!`);
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

	protected elementId: string;
	protected inputValue: NullIfEmpty<string>;
	protected typeGuard: TypeGuard;
	protected typeLabel: string;

	private fieldElement: HTMLElement;

	// TODO: inputValue really shouldn't be a field
	public constructor(elementId: string, inputValue: NullIfEmpty<string>, typeGuard: TypeGuard, typeLabel: string) {
		this.elementId = elementId;
		this.inputValue = inputValue;
		this.typeGuard = typeGuard;
		this.typeLabel = typeLabel;

		const fieldElement = document.getElementById(elementId);
		if (!fieldElement) throw new Error(`Failed to get element ${elementId}.`);

		this.fieldElement = fieldElement;
	}

	public static countValidatingFields(): number {
		return InputFieldValidator.validatingFields.size;
	}

	public static countInvalidFields(): number {
		return InputFieldValidator.invalidFields.size;
	}

	protected async validator(): Promise<NullIfEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		if (this.typeGuard(this.inputValue)) return this.inputValue;
		else {
			this.addInvalidError(`Input must be a ${this.typeLabel}!`);
			return InputFieldValidator.INVALID_INPUT;
		}
	}

	public async validate(): Promise<NullIfEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		this.addValidatingStatus();
		const validatedInput = await this.validator();
		this.removeValidatingStatus();

		if (validatedInput !== InputFieldValidator.INVALID_INPUT) this.removeInvalidError();

		return validatedInput;
	}

	protected addValidatingStatus() {
		this.removeInvalidError();

		InputFieldValidator.validatingFields.add(this.elementId);

		const status = 'Validating input...';

		const statusElement = document.getElementById(`validating-input-${this.elementId}`);
		const statusHTML = `<span id='validating-input-${this.elementId}' class='validating-input-status'>${status}</span>`;

		if (!statusElement) this.fieldElement.insertAdjacentHTML('beforebegin', statusHTML);
		else statusElement.innerHTML = status;

		SaveButton.updateState(SaveButtonUpdates.Pending);
	}

	private removeValidatingStatus() {
		InputFieldValidator.validatingFields.delete(this.elementId);

		document.getElementById(`validating-input-${this.elementId}`)?.remove();

		SaveButton.updateState(SaveButtonUpdates.Restore);
	}

	protected addInvalidError(error: string) {
		InputFieldValidator.invalidFields.add(this.elementId);

		this.fieldElement.classList.add('invalid-input');

		const errorElement = document.getElementById(`invalid-input-${this.elementId}`);
		const errorHTML = `<span id='invalid-input-${this.elementId}' class='invalid-input-error'>${error}</span>`;

		if (!errorElement) this.fieldElement.insertAdjacentHTML('beforebegin', errorHTML);
		else errorElement.innerHTML = error;

		SaveButton.updateState(SaveButtonUpdates.Disable);
	}

	private removeInvalidError() {
		InputFieldValidator.invalidFields.delete(this.elementId);

		document.getElementById(this.elementId)?.classList.remove('invalid-input');
		document.getElementById(`invalid-input-${this.elementId}`)?.remove();

		SaveButton.updateState(SaveButtonUpdates.Restore);
	}
}

abstract class RequiredField extends InputFieldValidator {
	protected override async validator(): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
		if (this.inputValue) {
			if (this.typeGuard(this.inputValue)) return this.inputValue;
			else this.addInvalidError(`Input must be a ${this.typeLabel}!`);
		}
		else this.addInvalidError('Required field cannot be empty!');

		return InputFieldValidator.INVALID_INPUT;
	}
}

abstract class RequiredFieldCache extends RequiredField {
	protected static cache: Record<string, NeverEmpty<string>> = {};

	public getCachedInput(): NeverEmpty<string> | undefined {
		return RequiredFieldCache.cache?.[this.elementId];
	}

	protected cacheInput<T extends NeverEmpty<string>>(inputValue: T): T {
		return RequiredFieldCache.cache[this.elementId] = inputValue;
	}
}

abstract class JSONObjectField extends InputFieldValidator {
	protected override async validator(): Promise<NeverEmpty<string> | '{}' | typeof InputFieldValidator.INVALID_INPUT> {
		try {
			if (!this.inputValue) return '{}';

			const parsed = JSON.parse(this.inputValue);

			// JSON can't serialise any non-primitives other than 'objects' and arrays, so this will do
			if (parsed instanceof Object && !Array.isArray(parsed)) {
				if (Object.values(parsed).every(this.typeGuard)) {
					document.getElementById(this.elementId)?.classList?.remove('invalid-input');
					return this.inputValue;
				}
				else this.addInvalidError(`All object values must be ${this.typeLabel}s!`);
			}
			else this.addInvalidError('Input must be an object <code>{}</code>.');

			return InputFieldValidator.INVALID_INPUT;
		}
		catch {
			this.addInvalidError('Input is not valid <code>JSON</code>.');
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
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isNullableString, 'string');
	}
}

export class RequiredStringField extends RequiredField {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}
}

export class RequiredNumberAsStringField extends RequiredField {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isParsableNumber, 'number');
	}
}

export class RequiredNotionKeyField extends RequiredFieldCache {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}

	protected override async validator(): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
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
		return InputFieldValidator.INVALID_INPUT;
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

			if (keyInput && keyConfiguration.Validator) {
				const keyValidator = new keyConfiguration.Validator(keyConfiguration.elementId, keyInput);

				// if the keyInput has been cached by RequiredNotionKeyField, just return it without validating again
				if (keyValidator instanceof RequiredFieldCache && keyValidator.getCachedInput() === keyInput) return keyInput;

				const validatedKey = await new keyConfiguration.Validator(keyConfiguration.elementId, keyInput).validate();
				if (validatedKey !== InputFieldValidator.INVALID_INPUT) return validatedKey;
			}
		}

		return null;
	}

	protected override async validator(): Promise<NeverEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
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
		return InputFieldValidator.INVALID_INPUT;
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

export class TimeZoneField extends InputFieldValidator {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isNullableString, 'string');
	}

	protected override async validator(): Promise<NullIfEmpty<string> | typeof InputFieldValidator.INVALID_INPUT> {
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
		return InputFieldValidator.INVALID_INPUT;
	}
}