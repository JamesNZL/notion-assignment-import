import { NullIfEmpty, NeverEmpty } from './';

type TypeGuard = (value: unknown) => boolean;

const typeGuards: Record<string, TypeGuard> = {
	isNullableString(value) {
		return typeof value === 'string' || value === null;
	},
	isString(value) {
		return typeof value === 'string';
	},
	isCastableNumber(value) {
		return (typeof value === 'string' && !isNaN(Number(value)));
	},
	isEmojiRequest(value) {
		return (typeof value === 'string' && /\p{Extended_Pictographic}/ug.test(value));
	},
};

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
			// ! document.getElementById(this.elementId)?.classList?.remove('missing-required');

			// ! if (Object.values(requiredFields).every(input => input.value) && saveButton) {
			// ! 	saveButton.innerHTML = 'Save';
			// ! 	saveButton.classList.add('green');
			// ! 	saveButton.classList.remove('red');
			// ! }

			return this.inputValue;
		}

		// ! document.getElementById(this.elementId)?.classList?.add('missing-required');

		// ! if (saveButton) {
		// ! 	saveButton.innerHTML = 'Missing required fields!';
		// ! 	saveButton.classList.add('red');
		// ! 	saveButton.classList.remove('green');
		// ! }

		return InputValidator.INVALID_INPUT;
	}
}

abstract class JSONObjectInput extends InputValidator {
	public override validate() {
		// ! TODO: invalid input
		try {
			if (this.inputValue) {
				const parsed = JSON.parse(this.inputValue);

				if (parsed instanceof Object && Object.values(parsed).every(this.typeGuard)) {
					document.getElementById(this.elementId)?.classList?.remove('missing-required');
					return this.inputValue;
				}
			}

			// ! boo
			throw 'ERORROAWDAWd';
		}
		catch (error) {
			// ! document.getElementById(this.elementId)?.classList?.add('missing-required');
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

// class Field extends Input<T> {
// 	/* private static fieldTypes: Record<keyof RequiredFields, Input<unknown>> & Partial<Record<keyof OptionalFields, Input<unknown>>> = {
// 		'canvas.classNames.breadcrumbs': RequiredStringInput,
// 		'canvas.classNames.assignment': RequiredStringInput,
// 		'canvas.classNames.title': RequiredStringInput,
// 		'canvas.classNames.availableDate': RequiredStringInput,
// 		'canvas.classNames.availableStatus': RequiredStringInput,
// 		'canvas.classNames.dueDate': RequiredStringInput,
// 		'canvas.classNames.dateElement': RequiredStringInput,
// 		'canvas.classValues.notAvailable': RequiredStringInput,
// 		'notion.notionKey': RequiredStringInput,
// 		'notion.databaseId': RequiredStringInput,
// 		'canvas.classValues.courseCodeN': RequiredNumberInput,
// 		'canvas.courseCodeOverrides': JSONStringObjectInput,
// 		'notion.courseEmojis': JSONEmojiObjectInput,
// 	}; */

// 	protected field: keyof SavedFields;

// 	public constructor(field: keyof SavedFields, elementId: string, inputValue: NullIfEmpty<string>) {

// 		this.field = field;
// 	}

// 	public validateField(): ReturnType<Validator> {
// 		if (Field.fieldTypes[this.field]) {
// 			const a = new <Field>(Field.fieldTypes[this.field])(this.field);
// 		}
// 	}
// }

// const requiredFields = (<NodeListOf<HTMLInputElement>>document.querySelectorAll('input[required]'));
// const saveButton = document.getElementById('save-button');