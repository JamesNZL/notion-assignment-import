import { Element } from './Element';

import { SupportedTypes } from '../options/configuration';

export class Input extends Element {
	protected constructor(id: string, type = 'input') {
		super(id, type);
	}

	public static override getInstance<T extends string>(id: T): Input {
		return Input.instances[id] = (Input.instances[id] instanceof Input)
			? <Input>Input.instances[id]
			: new Input(id);
	}

	private static isValid(element: HTMLElement | null): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
		return (Boolean(element) && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement));
	}

	private static useChecked(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
		return (element.type === 'checkbox' || element.type === 'radio');
	}

	public getValue(): SupportedTypes | void {
		if (!Input.isValid(this.element)) return;

		if (this.element instanceof HTMLInputElement && Input.useChecked(this.element)) {
			return this.element.checked;
		}

		return this.element.value.trim() || null;
	}

	public setValue(value: SupportedTypes, dispatchEvent = true) {
		if (!Input.isValid(this.element)) return;

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

		throw new Error(`Failed to set unexpected value ${value} of type ${typeof value} on element ${this.element.id}`);
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