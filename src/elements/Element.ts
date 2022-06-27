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

	private static isSomeChildShown(parentElement: HTMLElement) {
		return Array.from(parentElement.children).some(child => !child.classList.contains('hidden'));
	}

	private static isEveryChildHidden(parentElement: HTMLElement) {
		return Array.from(parentElement.children).every(child => child.classList.contains('hidden'));
	}

	public isHidden() {
		return this.element.classList.contains('hidden');
	}

	public show() {
		this.removeClass('hidden');
		this.getLabels()?.forEach(label => label.classList.remove('hidden'));

		if (!this.element.parentElement) return;

		if (Element.isSomeChildShown(this.element.parentElement)) {
			this.element.parentElement.classList.remove('hidden');
		}

		if (!this.element.parentElement.parentElement) return;
		if (!this.element.parentElement.parentElement.classList.contains('tile')) return;

		const parentTile = this.element.parentElement.parentElement;

		if (!Element.isSomeChildShown(parentTile)) return;

		parentTile.classList.remove('hidden');

		if (parentTile.previousElementSibling instanceof HTMLHeadingElement) {
			parentTile.previousElementSibling.classList.remove('hidden');
		}
	}

	public hide() {
		this.addClass('hidden');
		this.getLabels()?.forEach(label => label.classList.add('hidden'));

		if (!this.element.parentElement) return;

		if (Element.isEveryChildHidden(this.element.parentElement)) {
			this.element.parentElement.classList.add('hidden');
		}

		if (!this.element.parentElement.parentElement) return;
		if (!this.element.parentElement.parentElement.classList.contains('tile')) return;

		const parentTile = this.element.parentElement.parentElement;

		if (!Element.isEveryChildHidden(parentTile)) return;

		parentTile.classList.add('hidden');

		if (parentTile.previousElementSibling instanceof HTMLHeadingElement) {
			parentTile.previousElementSibling.classList.add('hidden');
		}
	}

	public getLabels() {
		return (this.element instanceof HTMLInputElement)
			? this.element.labels
			: document.querySelectorAll(`label[for='${this.element.id}']`);
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