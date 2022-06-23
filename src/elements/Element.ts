export abstract class Element {
	protected static instances: Record<string, Element> = {};

	protected element: HTMLElement;
	private timeouts: Record<string, NodeJS.Timeout> = {};

	protected constructor(id: string, type: string) {
		const element = document.getElementById(id);
		if (!element) throw new Error(`Invalid ${type} identifier ${id}!`);

		this.element = element;
	}

	public addClass(className: string) {
		this.element.classList.add(className);
	}

	public removeClass(className: string) {
		this.element.classList.remove(className);
	}

	public show() {
		this.removeClass('hidden');
		this.getLabels()?.forEach(label => label.classList.remove('hidden'));

		if (!this.element.parentElement) return;

		if (Array.from(this.element.parentElement.children).some(child => !child.classList.contains('hidden'))) {
			this.element.parentElement.classList.remove('hidden');
		}
	}

	public hide() {
		this.addClass('hidden');
		this.getLabels()?.forEach(label => label.classList.add('hidden'));

		if (!this.element.parentElement) return;

		if (Array.from(this.element.parentElement.children).every(child => child.classList.contains('hidden'))) {
			this.element.parentElement.classList.add('hidden');
		}
	}

	public getLabels() {
		return (this.element instanceof HTMLInputElement)
			? this.element.labels
			: document.querySelectorAll(`input[for='${this.element.id}']`);
	}

	public addEventListener(...args: Parameters<typeof HTMLElement.prototype.addEventListener>) {
		this.element.addEventListener(...args);
	}

	public setTimeout(name: string, timeout: () => void, delay: number) {
		clearTimeout(this.timeouts[name]);
		this.timeouts[name] = setTimeout(timeout, delay);
	}

	public clearTimeout(name: string) {
		clearTimeout(this.timeouts[name]);
	}
}