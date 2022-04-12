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

	public constructor(elementId: string, inputValue: NullIfEmpty<string>, typeGuard: TypeGuard) {
		this.elementId = elementId;
		this.inputValue = inputValue;
		this.typeGuard = typeGuard;
	}

	protected validator(): NullIfEmpty<string> | typeof InputValidator.INVALID_INPUT {
		return (this.typeGuard(this.inputValue))
			? this.inputValue
			: InputValidator.INVALID_INPUT;
	}

	public validate(): NullIfEmpty<string> | typeof InputValidator.INVALID_INPUT {
		const validatedInput = this.validator();

		(validatedInput === InputValidator.INVALID_INPUT)
			? this.addInvalidError('TEST++++++')
			: this.removeInvalidError();

		return validatedInput;
	}

	private addInvalidError(error: string) {
		InputValidator.invalidFields.add(this.elementId);

		const element = document.getElementById(this.elementId);

		if (element) {
			element.classList.add('invalid-input');

			if (!document.getElementById(`invalid-input-${this.elementId}`)) {
				element.insertAdjacentHTML('beforebegin', `<span id='invalid-input-${this.elementId}' class='invalid-input-error'>Invalid input! ${error}</span>`);
			}
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
		if (this.inputValue && this.typeGuard(this.inputValue)) {
			return this.inputValue;
		}
		return InputValidator.INVALID_INPUT;
	}
}

abstract class JSONObjectInput extends InputValidator {
	protected override validator(): NeverEmpty<string> | '{}' | typeof InputValidator.INVALID_INPUT {
		// ! TODO: invalid input
		try {
			if (!this.inputValue) return '{}';

			const parsed = JSON.parse(this.inputValue);

			if (parsed instanceof Object && Object.values(parsed).every(this.typeGuard)) {
				document.getElementById(this.elementId)?.classList?.remove('invalid-input');
				return this.inputValue;
			}

			// ! boo
			throw 'ERORROAWDAWd';
		}
		catch (error) {
			// ! document.getElementById(this.elementId)?.classList?.add('invalid-input');
			// ! document.getElementById(this.elementId)?.insertAdjacentHTML('beforebegin', '<span>Invalid input! blahblah</span>');

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
	isCastableNumber(value) {
		return (typeof value === 'string' && !isNaN(Number(value)));
	},
	isEmojiRequest(value) {
		return (typeof value === 'string' && /\p{Extended_Pictographic}/ug.test(value));
	},
};

export class StringInput extends InputValidator {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isNullableString);
	}
}

export class RequiredStringInput extends RequiredInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString);
	}
}

export class RequiredNumberInput extends RequiredInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isCastableNumber);
	}
}

export class JSONStringObjectInput extends JSONObjectInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isString);
	}
}

export class JSONEmojiObjectInput extends JSONObjectInput {
	public constructor(elementId: string, inputValue: NullIfEmpty<string>) {
		super(elementId, inputValue, typeGuards.isEmojiRequest);
	}
}