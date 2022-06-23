import { SupportedTypes } from '../options/configuration';

export class Input {
	private static instances: Record<string, Input> = {};

	private id: string;
	private element: HTMLElement;

	private constructor(id: string) {
		this.id = id;

		const element = document.getElementById(id);
		if (!element) throw new Error(`Invalid input identifier ${id}!`);

		this.element = element;
	}

	public static getInstance(id: string): Input {
		return Input.instances[id] = Input.instances[id] ?? new Input(id);
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

	public addEventListener(...args: Parameters<typeof HTMLElement.prototype.addEventListener>) {
		if (this.element) this.element.addEventListener(...args);
	}

	public dispatchInputEvent(bubbles = true) {
		this.element?.dispatchEvent(new Event('input', { bubbles }));
	}

	public getLabels() {
		if (!Input.isValid(this.element)) return;

		return this.element.labels;
	}

	public show() {
		this.element.classList.remove('hidden');
		this.getLabels()?.forEach(label => label.classList.remove('hidden'));

		if (!this.element.parentElement) return;

		if (Array.from(this.element.parentElement.children).some(child => !child.classList.contains('hidden'))) {
			this.element.parentElement.classList.remove('hidden');
		}
	}

	public hide() {
		this.element.classList.add('hidden');
		this.getLabels()?.forEach(label => label.classList.add('hidden'));

		if (!this.element.parentElement) return;

		if (Array.from(this.element.parentElement.children).every(child => child.classList.contains('hidden'))) {
			this.element.parentElement.classList.add('hidden');
		}
	}
}