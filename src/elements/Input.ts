import { SupportedTypes } from '../options/configuration';

export class Input {
	id: string;
	element: HTMLElement | null;

	constructor(id: string) {
		this.id = id;
		this.element = document.getElementById(id);
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

		throw new Error(`Failed to set unexpected value ${value} of type ${typeof value} on element ${this.id}`);
	}

	public dispatchInputEvent() {
		this.element?.dispatchEvent(new Event('input', { bubbles: true }));
	}
}