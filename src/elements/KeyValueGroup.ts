import { Element } from './Element';
import { Input } from './Input';

import { ValidatorConstructor, StringField } from '../options/validator';

export class KeyValueGroup extends Element {
	private keyGroup: Element;
	private valueGroup: Element;
	private valueInput: Input;

	private keyPlaceholder = '';
	private valuePlaceholder = '';

	private KeyValidator: ValidatorConstructor = StringField;
	private ValueValidator: ValidatorConstructor = StringField;

	private rows = 0;

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

	public addRow() {
		const keyHTML = `<input type='text' placeholder='${this.keyPlaceholder}' id='${this.keyGroup.id}-${this.rows}' name='${this.keyGroup.id}' class='row'>`;
		const valueHTML = `<input type='text' placeholder='${this.valuePlaceholder}' id='${this.keyGroup.id}-${this.rows}' name='${this.valueGroup.id}' class='row'>`;

		const keyInput = this.keyGroup.insertAdjacentHTML('beforeend', keyHTML);
		const valueInput = this.valueGroup.insertAdjacentHTML('beforeend', valueHTML);

		if (!keyInput || !valueInput) return;

		this.rows++;

		const keyValidator = new this.KeyValidator(keyInput.id);
		const valueValidator = new this.ValueValidator(valueInput.id);

		// TODO: check if should create/delete rows
		// TODO: update valueInput

		// TODO: refactor this to validator class
		keyInput?.addEventListener('input', () => {
			const inputValue = Input.getInstance(keyInput.id).getValue() ?? null;

			if (typeof inputValue === 'boolean') return inputValue;

			keyValidator.validate(inputValue);
		});

		valueInput?.addEventListener('input', () => {
			const inputValue = Input.getInstance(valueInput.id).getValue() ?? null;

			if (typeof inputValue === 'boolean') return inputValue;

			valueValidator.validate(inputValue);
		});
	}
}