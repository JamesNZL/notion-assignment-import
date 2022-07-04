export class Element {
	protected static instances: Record<string, Element> = {};

	protected element: HTMLElement;
	private timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

	private tile?: HTMLElement | false;
	private parentHeading?: HTMLHeadingElement | false;

	protected constructor(id: string, type: string) {
		const element = document.getElementById(id);
		if (!element) throw new Error(`Invalid ${type} identifier ${id}!`);

		this.element = element;
	}

	public static getInstance<T extends string>(id: T, type: string): Element {
		return Element.instances[id] ??= new Element(id, type);
	}

	public get id() {
		return this.element.id;
	}

	public get innerHTML() {
		return this.element.innerHTML;
	}

	public remove() {
		this.element.remove();
		delete Element.instances[this.id];
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

	private static findParentTile(element: HTMLElement): HTMLElement | false {
		if (element === document.body) return false;
		if (element.classList.contains('tile')) return element;

		return (element.parentElement)
			? Element.findParentTile(element.parentElement)
			: false;
	}

	public isHidden() {
		return this.element.classList.contains('hidden');
	}

	private parseHeadingLevel(tagName: string) {
		return Number(tagName.match(/\d+/));
	}

	private findParentHeading(heading: HTMLHeadingElement) {
		const thisLevel = this.parseHeadingLevel(heading.tagName);

		let previousElement = heading.previousElementSibling;
		while (previousElement && !(this.parseHeadingLevel(previousElement.tagName) < thisLevel)) {
			previousElement = previousElement.previousElementSibling;
		}

		if (!(previousElement instanceof HTMLHeadingElement)) return false;
		return previousElement;
	}

	private isAllHeadingChildrenHidden(heading: HTMLHeadingElement) {
		let nextElement = heading.nextElementSibling;
		while (nextElement?.classList.contains('hidden')) {
			nextElement = nextElement.nextElementSibling;
		}

		if (!nextElement) return true;
		if (!(nextElement instanceof HTMLHeadingElement)) return false;

		return (this.parseHeadingLevel(nextElement.tagName) <= this.parseHeadingLevel(heading.tagName));
	}

	public show() {
		this.removeClass('hidden');
		this.getLabels()?.forEach(label => label.classList.remove('hidden'));

		if (!this.element.parentElement) return;

		if (Element.isSomeChildShown(this.element.parentElement)) {
			this.element.parentElement.classList.remove('hidden');
		}

		this.tile ??= Element.findParentTile(this.element.parentElement);

		if (!this.tile || !Element.isSomeChildShown(this.tile)) return;

		this.tile.classList.remove('hidden');

		if (!(this.tile.previousElementSibling instanceof HTMLHeadingElement)) return;

		if (!this.isAllHeadingChildrenHidden(this.tile.previousElementSibling)) this.tile.previousElementSibling.classList.remove('hidden');

		this.parentHeading ??= this.findParentHeading(this.tile.previousElementSibling);

		if (!this.parentHeading) return;

		if (!this.isAllHeadingChildrenHidden(this.parentHeading)) this.parentHeading.classList.remove('hidden');
	}

	public hide() {
		this.addClass('hidden');
		this.getLabels()?.forEach(label => label.classList.add('hidden'));

		if (!this.element.parentElement) return;

		if (Element.isEveryChildHidden(this.element.parentElement)) {
			this.element.parentElement.classList.add('hidden');
		}

		this.tile ??= Element.findParentTile(this.element.parentElement);

		if (!this.tile || !Element.isEveryChildHidden(this.tile)) return;

		this.tile.classList.add('hidden');

		if (!(this.tile.previousElementSibling instanceof HTMLHeadingElement)) return;

		if (this.isAllHeadingChildrenHidden(this.tile.previousElementSibling)) this.tile.previousElementSibling.classList.add('hidden');

		this.parentHeading ??= this.findParentHeading(this.tile.previousElementSibling);

		if (!this.parentHeading) return;

		if (this.isAllHeadingChildrenHidden(this.parentHeading)) this.parentHeading.classList.add('hidden');
	}

	public getLabels() {
		return (this.element instanceof HTMLInputElement)
			? this.element.labels
			: document.querySelectorAll(`label[for='${this.element.id}']`);
	}

	public safelySetInnerHTML(html: string) {
		this.element.innerHTML = '';

		Array.from(
			new DOMParser().parseFromString(html, 'text/html')
				.getElementsByTagName('body')[0]
				.childNodes,
		)
			.forEach(this.element.appendChild.bind(this.element));
	}

	public insertAdjacentElement(...args: Parameters<typeof HTMLElement.prototype.insertAdjacentElement>) {
		return this.element.insertAdjacentElement(...args);
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

	public dispatchEvent(event: Event) {
		this.element.dispatchEvent(event);
	}
}