import { Element } from './Element';

export class Button extends Element {
	private buttonLabel: HTMLElement;
	private defaultHtml: string;
	private defaultClassList: string;

	protected constructor(id: string) {
		super(id, 'button');

		this.buttonLabel = this.element.querySelector('.button-label') ?? this.element;
		this.defaultHtml = this.element.innerHTML;
		this.defaultClassList = this.element.classList.value;
	}

	public static getInstance<T extends string>(id: T): Button {
		return Button.instances[id] = <Button>Button.instances[id] ?? new Button(id);
	}

	public setDefaultLabel(html: string) {
		this.defaultHtml = html;
	}

	public getButtonLabel() {
		return this.buttonLabel.innerHTML;
	}

	public setButtonLabel(html: string) {
		this.buttonLabel.innerHTML = html;
	}

	public resetHTML(delay?: number) {
		const reset = () => {
			this.setButtonLabel(this.defaultHtml);
			this.element.classList.value = this.defaultClassList;
		};

		if (!delay) return reset();
		this.setTimeout('resetHTML', reset, delay);
	}

	public disable() {
		if (this.element instanceof HTMLButtonElement) this.element.disabled = true;
	}

	public enable() {
		if (this.element instanceof HTMLButtonElement) this.element.disabled = false;
	}

	public click() {
		this.element.click();
	}
}