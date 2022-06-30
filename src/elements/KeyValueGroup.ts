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

	private keyPlaceholder = '';
	private valuePlaceholder = '';

	private KeyValidator: ValidatorConstructor = StringField;
	private ValueValidator: ValidatorConstructor = StringField;

	private keyValidateOn: 'input' | 'change' = 'change';
	private valueValidateOn: 'input' | 'change' = 'change';

	private rows: (RowInputs | null)[] = [];
	private restoreCount = 0;

	private constructor(id: string, keyGroupId: string, valueGroupId: string) {
		super(id, 'key-value group');

		this.keyGroup = Element.getInstance(keyGroupId, 'key group');
		this.valueGroup = Element.getInstance(valueGroupId, 'value group');
	}

	public static override getInstance<T extends string>(id: T, keyGroupId?: T, valueGroupId?: T): KeyValueGroup {
		if (!keyGroupId) throw new Error('Argument keyGroupId must be defined for class KeyValueGroup!');
		if (!valueGroupId) throw new Error('Argument valueGroupId must be defined for class KeyValueGroup!');

		return KeyValueGroup.instances[id] = (KeyValueGroup.instances[id] instanceof KeyValueGroup)
			? <KeyValueGroup>KeyValueGroup.instances[id]
			: new KeyValueGroup(id, keyGroupId, valueGroupId);
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
		const validatedInputs = await Promise.all(
			this.getLivingRows()
				.flatMap(({ keyInput, valueInput }) => [keyInput.validate(), valueInput.validate()]),
		);

		return (validatedInputs.includes(InputFieldValidator.INVALID_INPUT))
			? InputFieldValidator.INVALID_INPUT
			: this.getValue();

		// return (this.getLivingRows().some(({ keyInput, valueInput }) => !keyInput.isValid || !valueInput.isValid))
		// 	? InputFieldValidator.INVALID_INPUT
		// 	: this.getValue();
	}

	public getValue(): SupportedTypes {
		return this.serialiseInputs();
	}

	private serialiseInputs() {
		return JSON.stringify(
			Object.fromEntries(
				this.getLivingRows().filter(this.isRowFull)
					.map(({ keyInput, valueInput }) => [keyInput.getValue(), valueInput.getValue()]),
			),
		);
	}

	public setValue(value: SupportedTypes, dispatchEvent = true) {
		if (typeof value !== 'string') return;
		this.restoreRows(value, dispatchEvent);
	}

	public restoreRows(input: string, dispatchEvent = true) {
		if (this.getLivingRows().some(inputs => !this.isRowEmpty(inputs) && !this.isRowFull(inputs))) return;

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

			if (!dispatchEvent) return;
			this.dispatchInputEvent();
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

		const keyInput = Input.getInstance(keyId, 'input', this.KeyValidator);
		const valueInput = Input.getInstance(valueId, 'input', this.ValueValidator);

		if (!keyInput || !valueInput) return;

		this.rows.push({ keyInput, valueInput });

		keyInput.coupleValidators(valueInput, {
			propagateInvalidClass: false,
			propagateError: false,
		});

		async function inputListener(this: KeyValueGroup) {
			if ([await keyInput.validate(), await valueInput.validate()].includes(InputFieldValidator.INVALID_INPUT)) return;

			this.manageRows(row);

			if (this.getLivingRows().some(rowInput => !rowInput.keyInput.isValid || !rowInput.valueInput.isValid)) return;

			// remove dead rows from this.rows
			this.setValue(this.getValue());
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

	public dispatchInputEvent(bubbles = true) {
		this.element.dispatchEvent(new Event('input', { bubbles }));
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