import { NullIfEmpty, NeverEmpty } from './';

type TypeGuard = (value: unknown) => boolean;

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

export type InputValidatorConstructor = new (elementId: string, inputValue: NullIfEmpty<string>) => InputValidator;

export abstract class InputValidator {
	public static readonly INVALID_INPUT: unique symbol = Symbol('INVALID_INPUT');

	protected elementId: string;
	protected inputValue: NullIfEmpty<string>;
	protected typeGuard: TypeGuard;

	public constructor(elementId: string, inputValue: NullIfEmpty<string>, typeGuard: TypeGuard) {
		this.elementId = elementId;
		this.inputValue = inputValue;
		this.typeGuard = typeGuard;
	}

	public validate(): NullIfEmpty<string> | typeof InputValidator.INVALID_INPUT {
		return (this.typeGuard(this.inputValue))
			? this.inputValue
			: InputValidator.INVALID_INPUT;
	}

	public addInvalidError() {
		document.getElementById(this.elementId)?.insertAdjacentHTML('beforebegin', '<span>Invalid input! blahblah</span>');
	}

	// public removeInvalidError();
}

abstract class RequiredInput extends InputValidator {
	public override validate(): NeverEmpty<string> | typeof InputValidator.INVALID_INPUT {
		if (this.inputValue && this.typeGuard(this.inputValue)) {
			// ! document.getElementById(this.elementId)?.classList?.remove('invalid-input');

			// ! if (Object.values(requiredFields).every(input => input.value) && saveButton) {
			// ! 	saveButton.innerHTML = 'Save';
			// ! 	saveButton.classList.add('green');
			// ! 	saveButton.classList.remove('red');
			// ! }

			return this.inputValue;
		}

		// ! document.getElementById(this.elementId)?.classList?.add('invalid-input');

		// ! if (saveButton) {
		// ! 	saveButton.innerHTML = 'Missing required fields!';
		// ! 	saveButton.classList.add('red');
		// ! 	saveButton.classList.remove('green');
		// ! }

		return InputValidator.INVALID_INPUT;
	}
}

abstract class JSONObjectInput extends InputValidator {
	public override validate(): NeverEmpty<string> | '{}' | typeof InputValidator.INVALID_INPUT {
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

// const saveButton = document.getElementById('save-button');