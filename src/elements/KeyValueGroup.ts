import { Element } from './Element';
import { Input } from './Input';

import { SupportedTypes } from '../options/configuration';
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

	private keyValidateOn: 'input' | 'change' = 'change';
	private valueValidateOn: 'input' | 'change' = 'change';

	private rows: (RowInputs | null)[] = [];
	private restoreCount = 0;

	private constructor(id: string, keyGroupId: string, valueGroupId: string, valueInputId: string) {
		super(id, 'key-value group');

		this.keyGroup = Element.getInstance(keyGroupId, 'key group');
		this.valueGroup = Element.getInstance(valueGroupId, 'value group');
		this.valueInput = Input.getInstance(valueInputId);

		this.valueInput.addEventListener('input', this.restoreRows.bind(this));
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

	public setKeyValidateOn(validateOn: 'input' | 'change') {
		this.keyValidateOn = validateOn;
		return this;
	}

	public setValueValidateOn(validateOn: 'input' | 'change') {
		this.valueValidateOn = validateOn;
		return this;
	}

	public setPlaceholders({ key = '', value = '' }) {
		this.keyPlaceholder = key;
		this.valuePlaceholder = value;
		return this;
	}

	public async validate() {
		// TODO: implement this properly
		return this.getValue();
	}

	public getValue(): SupportedTypes {
		return this.valueInput.getValue();
	}

	public setValue(value: SupportedTypes, dispatchEvent = true) {
		this.valueInput.setValue(value, dispatchEvent);
	}

	public restoreRows() {
		if (this.getLivingRows().some(inputs => !this.isRowEmpty(inputs) && !this.isRowFull(inputs))) return;

		const input = this.valueInput.getValue();
		if (typeof input !== 'string') return;

		try {
			const parsed = JSON.parse(input);
			if (!(parsed instanceof Object)) return;

			this.rows.forEach((...[, index]) => this.removeRow(index));
			this.rows = [];
			this.restoreCount++;

			Object.entries(parsed).forEach(([key, value]) => {
				if (typeof value !== 'string' && typeof value !== 'boolean' && value !== null) return;

				this.addRow({ key, value });
			});

			if (!Object.entries(parsed).length) this.addRow();

			this.manageRows(this.rows.length - 1);
		}
		catch { null; }
	}

	private getKeyId(row: number) {
		return `${this.keyGroup.id}-${this.restoreCount}-${row}`;
	}

	private getValueId(row: number) {
		return `${this.valueGroup.id}-${this.restoreCount}-${row}`;
	}

	private getKeyHTML(keyId: string) {
		return `<input type='text' placeholder='${this.keyPlaceholder}' id='${keyId}' name='${this.keyGroup.id}' class='row'>`;
	}

	private getValueHTML(valueId: string) {
		return `<input type='text' placeholder='${this.valuePlaceholder}' id='${valueId}' name='${this.valueGroup.id}' class='row'>`;
	}

	private getLivingRows(): RowInputs[] {
		return <NonNullableValues<typeof this.rows>>this.rows.filter(Boolean);
	}

	private getRowInputs(row: number) {
		return this.rows[row] ?? { keyInput: null, valueInput: null };
	}

	public addRow(values?: { key: SupportedTypes, value: SupportedTypes; }) {
		const row = this.rows.length;
		const [keyId, valueId] = [this.getKeyId(row), this.getValueId(row)];

		this.keyGroup.insertAdjacentHTML('beforeend', this.getKeyHTML(keyId));
		this.valueGroup.insertAdjacentHTML('beforeend', this.getValueHTML(valueId));

		const [keyInput, valueInput] = [keyId, valueId].map(id => Input.getInstance(id));

		if (!keyInput || !valueInput) return;

		this.rows.push({ keyInput, valueInput });

		const keyValidator = new this.KeyValidator(keyId);
		const valueValidator = new this.ValueValidator(valueId);

		keyValidator.coupleTo(valueValidator, {
			propagateInvalidClass: false,
			propagateError: false,
		});

		async function inputListener(this: KeyValueGroup) {
			if ([await keyValidator.validate(), await valueValidator.validate()].includes(InputFieldValidator.INVALID_INPUT)) return;

			this.manageRows(row);
			this.updateValueInput();
		}

		keyInput.addEventListener(this.keyValidateOn, inputListener.bind(this));
		valueInput.addEventListener(this.valueValidateOn, inputListener.bind(this));

		if (!values) return;

		keyInput.setValue(values.key, false);
		valueInput.setValue(values.value, false);
	}

	private removeRow(row: number) {
		const { keyInput, valueInput } = this.getRowInputs(row);
		if (!keyInput || !valueInput) return;

		keyInput.remove();
		valueInput.remove();

		this.rows[row] = null;
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

		const emptyRows = this.getLivingRows().filter(this.isRowEmpty);

		if (this.isRowFull({ keyInput, valueInput }) && emptyRows.length === 0) return this.addRow();

		if (emptyRows.length <= 1) return;

		// remove the 'other' empty row so cursor focus isn't disrupted
		this.removeRow(this.rows.indexOf(emptyRows[1]));
	}

	private serialiseInputs() {
		return JSON.stringify(
			Object.fromEntries(
				this.getLivingRows().filter(this.isRowFull)
					.map(({ keyInput, valueInput }) => [keyInput.getValue(), valueInput.getValue()]),
			),
		);
	}

	private updateValueInput() {
		if (this.getLivingRows().some(({ keyInput, valueInput }) => !keyInput.isValid || !valueInput.isValid)) return;

		this.valueInput.setValue(this.serialiseInputs());
	}

	public dispatchInputEvent(bubbles = true) {
		this.valueInput.dispatchInputEvent(bubbles);
	}

	public toggleDependents(dependents: readonly string[]) {
		if (this.getValue() === '{}') {
			dependents.forEach(dependentId => Input.getInstance(dependentId).hide());

			return;
		}

		if (this.isHidden()) return;

		dependents.forEach(dependentId => Input.getInstance(dependentId).show());
	}
}