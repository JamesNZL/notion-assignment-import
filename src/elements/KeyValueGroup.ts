import { Element } from './Element';
import { Input } from './Input';

import { ValidatorConstructor, StringField, InputFieldValidator } from '../options/validator';

import { NonNullableValues } from '../types/utils';

interface RowInputs {
	keyInput: Input;
	valueInput: Input;
}

export class KeyValueGroup extends Element {
	private keyGroup: Element;
	private valueGroup: Element;
	private valueInput: Input;

	private keyPlaceholder = '';
	private valuePlaceholder = '';

	private KeyValidator: ValidatorConstructor = StringField;
	private ValueValidator: ValidatorConstructor = StringField;

	private rows: (RowInputs | null)[] = [];

	private constructor(id: string, keyGroupId: string, valueGroupId: string, valueInputId: string) {
		super(id, 'key-value group');

		this.keyGroup = Element.getInstance(keyGroupId, 'key group');
		this.valueGroup = Element.getInstance(valueGroupId, 'value group');
		this.valueInput = Input.getInstance(valueInputId);
	}

	public static override getInstance<T extends string>(id: T, keyGroupId?: T, valueGroupId?: T, valueInputId?: T): KeyValueGroup {
		if (!keyGroupId) throw new Error('Argument keyGroupId must be defined for class KeyValueGroup!');
		if (!valueGroupId) throw new Error('Argument valueGroupId must be defined for class KeyValueGroup!');
		if (!valueInputId) throw new Error('Argument valueInputId must be defined for class KeyValueGroup!');

		return KeyValueGroup.instances[id] = (KeyValueGroup.instances[id] instanceof KeyValueGroup)
			? <KeyValueGroup>KeyValueGroup.instances[id]
			: new KeyValueGroup(id, keyGroupId, valueGroupId, valueInputId);
	}

	public setKeyValidator(Validator: ValidatorConstructor) {
		this.KeyValidator = Validator;
		return this;
	}

	public setValueValidator(Validator: ValidatorConstructor) {
		this.ValueValidator = Validator;
		return this;
	}

	public setPlaceholders({ key = '', value = '' }) {
		this.keyPlaceholder = key;
		this.valuePlaceholder = value;
		return this;
	}

	private getKeyId(row: number) {
		return `${this.keyGroup.id}-${row}`;
	}

	private getValueId(row: number) {
		return `${this.valueGroup.id}-${row}`;
	}

	private getKeyHTML(keyId: string) {
		return `<input type='text' placeholder='${this.keyPlaceholder}' id='${keyId}' name='${this.keyGroup.id}' class='row'>`;
	}

	private getValueHTML(valueId: string) {
		return `<input type='text' placeholder='${this.valuePlaceholder}' id='${valueId}' name='${this.valueGroup.id}' class='row'>`;
	}

	private getRowInputs(row: number) {
		return this.rows[row] ?? { keyInput: null, valueInput: null };
	}

	public addRow() {
		const row = this.rows.length;
		const [keyId, valueId] = [this.getKeyId(row), this.getValueId(row)];

		this.keyGroup.insertAdjacentHTML('beforeend', this.getKeyHTML(keyId));
		this.valueGroup.insertAdjacentHTML('beforeend', this.getValueHTML(valueId));

		const [keyInput, valueInput] = [keyId, valueId].map(id => Input.getInstance(id));

		if (!keyInput || !valueInput) return;

		this.rows.push({ keyInput, valueInput });

		const keyValidator = new this.KeyValidator(keyId);
		const valueValidator = new this.ValueValidator(valueId);

		async function inputListener(this: KeyValueGroup) {
			if ([await keyValidator.validate(), await valueValidator.validate()].includes(InputFieldValidator.INVALID_INPUT)) return;

			// TODO: update valueInput if valid
			this.manageRows(row);
		}

		// TODO: make invalid fields align

		[keyInput, valueInput].forEach(input => input.addEventListener('input', inputListener.bind(this)));
	}

	private isRowEmpty({ keyInput, valueInput }: NonNullableValues<RowInputs>) {
		return keyInput.getValue() === null && valueInput.getValue() === null;
	}

	private isRowFull({ keyInput, valueInput }: NonNullableValues<RowInputs>) {
		return keyInput.getValue() !== null && valueInput.getValue() !== null;
	}

	private manageRows(row: number) {
		const { keyInput, valueInput } = this.getRowInputs(row);
		if (!keyInput || !valueInput) return;

		const emptyRows = (<NonNullableValues<typeof this.rows>>this.rows.filter(Boolean))
			.filter(this.isRowEmpty);

		if (this.isRowFull({ keyInput, valueInput }) && emptyRows.length === 0) return this.addRow();

		if (emptyRows.length <= 1) return;

		// remove the 'other' empty row so cursor focus isn't disrupted
		emptyRows[1].keyInput.remove();
		emptyRows[1].valueInput.remove();

		this.rows[this.rows.indexOf(emptyRows[1])] = null;

		console.log(this.rows);
	}
}