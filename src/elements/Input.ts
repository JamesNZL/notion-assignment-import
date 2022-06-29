import { Element } from './Element';

import { SupportedTypes } from '../options/configuration';
import { InputFieldValidator, ValidatorConstructor } from '../options/validator';

export class Input extends Element {
	private validator?: InputFieldValidator;

	protected element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

	protected constructor(id: string, type = 'input', Validator?: ValidatorConstructor) {
		super(id, type);

		const element = document.getElementById(id);
		if (!element) throw new Error(`Invalid ${type} identifier ${id}!`);
		if (!Input.isValid(element)) throw new Error(`Invalid input element ${element}`);

		this.element = element;

		if (Validator) this.validator = new Validator(id);
	}

	public static override getInstance<T extends string>(id: T, type = 'input', Validator?: ValidatorConstructor): Input {
		return Input.instances[id] = (Input.instances[id] instanceof Input)
			? <Input>Input.instances[id]
			: new Input(id, type, Validator);
	}

	private static isValid(element: HTMLElement | null): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
		return (Boolean(element) && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement));
	}

	private static useChecked(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
		return (element.type === 'checkbox' || element.type === 'radio');
	}

	public get isValid() {
		return !this.element.classList.contains('invalid-input');
	}

	public async validate() {
		if (!this.validator) return this.getValue();
		return await this.validator.validate();
	}

	public getValue(): SupportedTypes {
		if (this.element instanceof HTMLInputElement && Input.useChecked(this.element)) {
			return this.element.checked;
		}

		return this.element.value.trim() || null;
	}

	public setValue(value: SupportedTypes, dispatchEvent = true) {
		if (this.element instanceof HTMLInputElement && Input.useChecked(this.element) && typeof value === 'boolean') {
			this.element.checked = value;

			if (dispatchEvent) this.dispatchInputEvent();
			return;
		}

		if (typeof value === 'string' || value == null) {
			this.element.value = value ?? '';

			if (dispatchEvent) this.dispatchInputEvent();
			return;
		}

		throw new Error(`Failed to set unexpected value ${value} of type ${typeof value} on element ${this.id}`);
	}

	public setPlaceholder(placeholder: SupportedTypes) {
		if (!(this.element instanceof HTMLInputElement) && !(this.element instanceof HTMLTextAreaElement)) return;

		if (typeof placeholder !== 'string') return;

		this.element.setAttribute('placeholder', placeholder);
	}

	public override show() {
		super.show();
		this.dispatchInputEvent();
	}

	public override hide() {
		super.hide();
		this.dispatchInputEvent();
	}

	public dispatchInputEvent(bubbles = true) {
		this.element.dispatchEvent(new Event('input', { bubbles }));
	}

	public toggleDependents(dependents: readonly string[]) {
		if (this.getValue() === null) {
			dependents.forEach(dependentId => Input.getInstance(dependentId).hide());

			return;
		}

		if (this.isHidden()) return;

		dependents.forEach(dependentId => Input.getInstance(dependentId).show());
	}
}