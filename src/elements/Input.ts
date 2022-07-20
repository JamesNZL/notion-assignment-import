import { Element } from './Element';

import { SupportedTypes } from '../options/configuration';
import { InputFieldValidator, ValidatorConstructor } from '../options/validator';

export class Input extends Element {
	private validator?: InputFieldValidator;
	private validatePromise?: Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT>;

	protected element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

	protected constructor({ id, type, Validator }: {
		id: string;
		type: string;
		Validator?: ValidatorConstructor;
	}) {
		super({ id, type });

		const element = document.getElementById(id);
		if (!element) throw new Error(`Invalid ${type} identifier ${id}!`);
		if (!Input.isValid(element)) throw new Error(`Invalid input element ${element}`);

		this.element = element;

		if (Validator) this.validator = new Validator(id);
	}

	public static override getInstance<T extends string>({ id, type = 'input', Validator }: {
		id: T;
		type?: string;
		Validator?: ValidatorConstructor;
	}): Input {
		if (!(Input.instances.get(id) instanceof Input)) {
			Input.instances.set(id, new Input({ id, type, Validator }));
		}

		return <Input>Input.instances.get(id);
	}

	private static isValid(element: HTMLElement | null): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
		return (Boolean(element) && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement));
	}

	private static useChecked(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
		return (element.type === 'checkbox' || element.type === 'radio');
	}

	public get isValidating() {
		return InputFieldValidator.validatingFields.has(this.id);
	}

	public get isValid() {
		return !InputFieldValidator.invalidFields.has(this.id);
	}

	public async validate() {
		if (!this.validator) return this.getValue();
		return this.validatePromise = this.validator.validate();
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

	public markModified(comparand: SupportedTypes) {
		const isModified = (!this.isHidden && this.getValue() !== comparand);

		this.getLabels().forEach(label => {
			(isModified)
				? label.classList.add('unsaved')
				: label.classList.remove('unsaved');
		});

		return isModified;
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

	public coupleValidators(input: Input, {
		propagateInvalidClass = true,
		propagateError = true,
	}) {
		if (!this.validator || !input.validator) return;
		this.validator.coupleTo(input.validator, { propagateInvalidClass, propagateError });
	}

	public dispatchInputEvent(bubbles = true) {
		this.dispatchEvent(new Event('input', { bubbles }));
	}

	public async toggleDependents(dependents: readonly string[]) {
		await this.validatePromise;

		if (!this.isValid || this.isHidden || this.getValue() === null) {
			dependents.forEach(dependentId => {
				const dependent = Element.getInstance({
					id: dependentId,
					type: 'dependent',
				});
				dependent.hide();
				dependent.dispatchEvent(new Event('input', { bubbles: true }));
			});

			return;
		}

		dependents.forEach(dependentId => {
			const dependent = Element.getInstance({
				id: dependentId,
				type: 'dependent',
			});
			dependent.show();
			dependent.dispatchEvent(new Event('input', { bubbles: true }));
		});
	}
}