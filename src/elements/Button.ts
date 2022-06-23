import { getElementById } from '.';

export class Button {
	protected static instances: Record<string, Button> = {};

	private button: HTMLElement;
	private label: HTMLElement;

	private defaultHtml: string;
	private defaultClassList: string;

	private timeouts: Record<string, NodeJS.Timeout> = {};

	protected constructor(id: string) {
		const element = getElementById(id);

		if (!element) throw new Error(`Invalid button identifier ${id}!`);

		this.button = element;
		this.label = (element instanceof HTMLButtonElement)
			? element.labels[0] ?? element
			: element;

		this.defaultHtml = element.innerHTML;
		this.defaultClassList = element.classList.value;
	}

	public static getInstance<T extends string>(id: T) {
		return Button.instances[id] = Button.instances[id] ?? new Button(id);
	}

	public getLabel() {
		return this.label.innerHTML;
	}

	public setLabel(html: string) {
		this.label.innerHTML = html;
	}

	public resetHTML(delay?: number) {
		const reset = () => {
			this.setLabel(this.defaultHtml);
			this.button.classList.value = this.defaultClassList;
		};

		if (!delay) return reset();
		this.setTimeout('resetHTML', reset, delay);
	}

	public addClass(className: string) {
		this.button.classList.add(className);
	}

	public removeClass(className: string) {
		this.button.classList.remove(className);
	}

	// TODO: extend a base class with these methods
	public show() {
		this.removeClass('hidden');
		if (this.label !== this.button) this.label.classList.remove('hidden');

		if (!this.button.parentElement) return;

		if (Array.from(this.button.parentElement.children).some(child => !child.classList.contains('hidden'))) {
			this.button.parentElement.classList.remove('hidden');
		}
	}

	public hide() {
		this.addClass('hidden');
		if (this.label !== this.button) this.label.classList.add('hidden');

		if (!this.button.parentElement) return;

		if (Array.from(this.button.parentElement.children).every(child => child.classList.contains('hidden'))) {
			this.button.parentElement.classList.add('hidden');
		}
	}

	public disable() {
		if (this.button instanceof HTMLButtonElement) this.button.disabled = true;
	}

	public enable() {
		if (this.button instanceof HTMLButtonElement) this.button.disabled = false;
	}

	public addEventListener(...args: Parameters<typeof HTMLElement.prototype.addEventListener>) {
		this.button.addEventListener(...args);
	}

	public setTimeout(name: string, timeout: () => void, delay: number) {
		clearTimeout(this.timeouts[name]);
		this.timeouts[name] = setTimeout(timeout, delay);
	}

	public clearTimeout(name: string) {
		clearTimeout(this.timeouts[name]);
	}
}