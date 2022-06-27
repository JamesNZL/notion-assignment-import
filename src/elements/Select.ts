import { Input } from './Input';

export class Select extends Input {
	protected constructor(id: string) {
		super(id, 'select');
	}

	public static getInstance<T extends string>(id: T): Select {
		return Select.instances[id] = <Select>Select.instances[id] ?? new Select(id);
	}

	public setInnerHTML(html: string) {
		this.element.innerHTML = html;
	}
}