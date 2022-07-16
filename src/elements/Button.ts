import { Element } from './Element';

export class Button extends Element {
	private buttonLabel: Element;
	private defaultHtml: string;
	private defaultClassList: string;

	protected constructor(id: string) {
		super(id, 'button');

		this.buttonLabel = Element.getInstance(
			this.element.querySelector('.button-label')?.id ?? this.element.id, 'button label',
		);
		this.defaultHtml = this.element.innerHTML;
		this.defaultClassList = this.element.classList.value;
	}

	public static override getInstance<T extends string>(id: T): Button {
		if (!(Button.instances.get(id) instanceof Button)) {
			Button.instances.set(id, new Button(id));
		}

		return <Button>Button.instances.get(id);
	}

	public setDefaultLabel(html: string) {
		this.defaultHtml = html;
	}

	public getButtonLabel() {
		return this.buttonLabel.innerHTML;
	}

	public setButtonLabel(html: string) {
		this.buttonLabel.safelySetInnerHTML(html);
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