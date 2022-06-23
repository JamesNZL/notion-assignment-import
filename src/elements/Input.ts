import { Element } from './Element';

import { SupportedTypes } from '../options/configuration';

export class Input extends Element {
	protected constructor(id: string) {
		super(id, 'input');
	}

	public static getInstance(id: string): Input {
		return Input.instances[id] = <Input>Input.instances[id] ?? new Input(id);
	}

	private static isValid(element: HTMLElement | null): element is HTMLInputElement | HTMLTextAreaElement {
		return (Boolean(element) && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement));
	}

	private static useChecked(element: HTMLInputElement | HTMLTextAreaElement) {
		return (element.type === 'checkbox' || element.type === 'radio');
	}

	public getValue(): SupportedTypes | void {
		if (!Input.isValid(this.element)) return;

		if (this.element instanceof HTMLInputElement && Input.useChecked(this.element)) {
			return this.element.checked;
		}

		return this.element.value.trim() || null;
	}

	public setValue(value: SupportedTypes) {
		if (!Input.isValid(this.element)) return;

		if (this.element instanceof HTMLInputElement && Input.useChecked(this.element) && typeof value === 'boolean') {
			return this.element.checked = value;
		}

		if (typeof value === 'string' || value == null) {
			return this.element.value = value ?? '';
		}

		throw new Error(`Failed to set unexpected value ${value} of type ${typeof value} on element ${this.element.id}`);
	}

	public dispatchInputEvent(bubbles = true) {
		this.element.dispatchEvent(new Event('input', { bubbles }));
	}

	public toggleDependents(dependents: readonly string[]) {
		if (this.getValue() === null) {
			return dependents.forEach(dependentId => Input.getInstance(dependentId).hide());
		}

		dependents.forEach(dependentId => Input.getInstance(dependentId).show());
	}
}