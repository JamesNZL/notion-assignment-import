import { Element } from './Element';

export class Button extends Element {
	private buttonLabel: Element;
	private defaultLabelHTML: string;
	private defaultClassList: string;

	protected constructor({ id, type }: {
		id: string;
		type: string;
	}) {
		super({ id, type });

		this.buttonLabel = Element.getInstance({
			id: this.element.querySelector('.button-label')?.id ?? this.element.id,
			type: 'button label',
		});
		this.defaultLabelHTML = this.buttonLabel.innerHTML;
		this.defaultClassList = this.element.classList.value;
	}

	public static override getInstance<T extends string>({ id, type = 'button' }: {
		id: T;
		type?: string;
	}): Button {
		if (!(Button.instances.get(id) instanceof Button)) {
			Button.instances.set(id, new Button({ id, type }));
		}

		return <Button>Button.instances.get(id);
	}

	public setDefaultLabel(html: string) {
		this.defaultLabelHTML = html;
	}

	public getButtonLabel() {
		return this.buttonLabel.innerHTML;
	}

	public setButtonLabel(html: string) {
		this.buttonLabel.safelySetInnerHTML(html);
	}

	public resetHTML(delay?: number) {
		const reset = () => {
			this.setButtonLabel(this.defaultLabelHTML);
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
		if (!(this.element instanceof HTMLElement)) return;
		this.element.click();
	}
}