import { NullIfEmpty, NeverEmpty } from './';

type TypeGuard = (value: unknown) => boolean;

export type InputValidatorConstructor = new (elementId: string, inputValue: NullIfEmpty<string>) => InputValidator;

export abstract class InputValidator {
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

	protected validator(): NullIfEmpty<string> | typeof InputValidator.INVALID_INPUT {
		if (this.typeGuard(this.inputValue)) return this.inputValue;
		else {
			this.addInvalidError(`Input must be a ${this.type}!`);
			return InputValidator.INVALID_INPUT;
		}
	}

	public validate(): NullIfEmpty<string> | typeof InputValidator.INVALID_INPUT {
		const validatedInput = this.validator();

		if (validatedInput !== InputValidator.INVALID_INPUT) this.removeInvalidError();

		return validatedInput;
	}

	protected addInvalidError(error: string) {
		InputValidator.invalidFields.add(this.elementId);

		const fieldElement = document.getElementById(this.elementId);

		if (fieldElement) {
			fieldElement.classList.add('invalid-input');

			const errorElement = document.getElementById(`invalid-input-${this.elementId}`);
			const errorHTML = `<span id='invalid-input-${this.elementId}' class='invalid-input-error'>${error}</span>`;

			if (!errorElement) fieldElement.insertAdjacentHTML('beforebegin', errorHTML);
			else errorElement.innerHTML = errorHTML;
		}

		InputValidator.disableSaveButton();
	}

	private removeInvalidError() {
		InputValidator.invalidFields.delete(this.elementId);

		document.getElementById(this.elementId)?.classList.remove('invalid-input');
		document.getElementById(`invalid-input-${this.elementId}`)?.remove();

		InputValidator.restoreSaveButton();
	}

	private static disableSaveButton() {
		if (InputValidator.saveButton && InputValidator.saveButton instanceof HTMLButtonElement) {
			InputValidator.saveButton.innerHTML = `${InputValidator.invalidFields.size} invalid input${(InputValidator.invalidFields.size > 1) ? 's' : ''}!`;
			InputValidator.saveButton.disabled = true;
			InputValidator.saveButton.classList.add('red');
			InputValidator.saveButton.classList.remove('green');
		}
	}

	private static restoreSaveButton() {
		if (InputValidator.invalidFields.size > 0) return InputValidator.disableSaveButton();

		if (InputValidator.saveButton && InputValidator.saveButton instanceof HTMLButtonElement) {
			InputValidator.saveButton.innerHTML = 'Save';
			InputValidator.saveButton.disabled = false;
			InputValidator.saveButton.classList.add('green');
			InputValidator.saveButton.classList.remove('red');
		}
	}
}

abstract class RequiredInput extends InputValidator {
	protected override validator(): NeverEmpty<string> | typeof InputValidator.INVALID_INPUT {
		if (this.inputValue) {
			if (this.typeGuard(this.inputValue)) return this.inputValue;
			else this.addInvalidError(`Input must be a ${this.type}!`);
		}
		else this.addInvalidError('Field cannot be empty!');

		return InputValidator.INVALID_INPUT;
	}
}

abstract class JSONObjectInput extends InputValidator {
	protected override validator(): NeverEmpty<string> | '{}' | typeof InputValidator.INVALID_INPUT {
		try {
			if (!this.inputValue) return '{}';

			const parsed = JSON.parse(this.inputValue);

			// TODO: arrays are also Object!
			if (parsed instanceof Object) {
				if (Object.values(parsed).every(this.typeGuard)) {
					document.getElementById(this.elementId)?.classList?.remove('invalid-input');
					return this.inputValue;
				}
				else this.addInvalidError(`<code>Object</code> values must all be ${this.type}s!`);
			}
			else this.addInvalidError('Input must be an <code>Object</code>!');

			return InputValidator.INVALID_INPUT;
		}
		catch {
			this.addInvalidError('Input is not valid <code>JSON</code>.');
			return InputValidator.INVALID_INPUT;
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
		return (typeof value === 'string' && /\p{Extended_Pictographic}/ug.test(value));
	},
};

export class StringInput extends InputValidator {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isNullableString, 'string');
	}
}

export class RequiredStringInput extends RequiredInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}
}

export class RequiredNumberInput extends RequiredInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isParsableNumber, 'number');
	}
}

export class JSONStringObjectInput extends JSONObjectInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString, 'string');
	}
}

export class JSONEmojiObjectInput extends JSONObjectInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isEmojiRequest, 'emoji');
	}
}