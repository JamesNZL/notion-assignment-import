export class Element {
	protected static instances = new Map<string, Element>();

	protected element: globalThis.Element;
	private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

	private _tile?: globalThis.Element | false;
	private parentHeading?: HTMLHeadingElement | false;

	protected constructor({ id, type, element }: {
		id: string;
		type: string;
		element?: globalThis.Element | null;
	}) {
		element ??= document.getElementById(id);
		if (!element) throw new Error(`Invalid ${type} identifier ${id}!`);

		element.id = id;

		this.element = element;
	}

	public static getInstance<T extends string>({ id, type, element }: {
		id: T;
		type: string;
		element?: globalThis.Element;
	}): Element {
		if (!Element.instances.has(id)) {
			Element.instances.set(id, new Element({ id, type, element }));
		}

		return <Element>Element.instances.get(id);
	}

	public get id() {
		return this.element.id;
	}

	private get tile() {
		return this._tile ??= Element.findParentTile(this.element);
	}

	public get innerHTML() {
		return this.element.innerHTML;
	}

	public remove() {
		this.element.remove();
		Element.instances.delete(this.id);
	}

	public addClass(className: string) {
		this.element.classList.add(className);
	}

	public removeClass(className: string) {
		this.element.classList.remove(className);
	}

	private static isSomeChildShown(parentElement: globalThis.Element) {
		return Array.from(parentElement.children).some(child => !child.classList.contains('hidden'));
	}

	private static isEveryChildHidden(parentElement: globalThis.Element) {
		return Array.from(parentElement.children).every(child => child.classList.contains('hidden'));
	}

	private static findParentTile(element: globalThis.Element): globalThis.Element | false {
		if (element === document.body) return false;
		if (element.classList.contains('tile')) return element;

		return (element.parentElement)
			? Element.findParentTile(element.parentElement)
			: false;
	}

	public get isSelfHidden() {
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
		this.getLabels().forEach(label => label.classList.remove('hidden'));

		if (!this.element.parentElement) return;

		if (Element.isSomeChildShown(this.element.parentElement)) {
			this.element.parentElement.classList.remove('hidden');
		}

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
		this.getLabels().forEach(label => label.classList.add('hidden'));

		if (!this.element.parentElement) return;

		if (Element.isEveryChildHidden(this.element.parentElement)) {
			this.element.parentElement.classList.add('hidden');
		}

		if (!this.tile || !Element.isEveryChildHidden(this.tile)) return;

		this.tile.classList.add('hidden');

		if (!(this.tile.previousElementSibling instanceof HTMLHeadingElement)) return;

		if (this.isAllHeadingChildrenHidden(this.tile.previousElementSibling)) this.tile.previousElementSibling.classList.add('hidden');

		this.parentHeading ??= this.findParentHeading(this.tile.previousElementSibling);

		if (!this.parentHeading) return;

		if (this.isAllHeadingChildrenHidden(this.parentHeading)) this.parentHeading.classList.add('hidden');
	}

	public getLabels() {
		const nodeList = (this.element instanceof HTMLInputElement)
			? this.element.labels
			: document.querySelectorAll(`label[for='${this.element.id}']`);

		return Array.from(nodeList ?? []);
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

	public insertAdjacentElement(...args: Parameters<typeof globalThis.Element.prototype.insertAdjacentElement>) {
		return this.element.insertAdjacentElement(...args);
	}

	public addEventListener(...args: Parameters<typeof globalThis.Element.prototype.addEventListener>) {
		this.element.addEventListener(...args);
	}

	public setTimeout(name: string, timeout: () => void, delay: number) {
		clearTimeout(this.timeouts.get(name));
		this.timeouts.set(name, setTimeout(timeout, delay));
	}

	public clearTimeout(name: string) {
		clearTimeout(this.timeouts.get(name));
	}

	public dispatchEvent(event: Event) {
		this.element.dispatchEvent(event);
	}
}