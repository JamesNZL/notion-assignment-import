import { Input } from './Input';

export class Select extends Input {
	protected constructor(id: string) {
		super(id, 'select');
	}

	public static override getInstance<T extends string>(id: T): Select {
		return Select.instances[id] = (Select.instances[id] instanceof Select)
			? <Select>Select.instances[id]
			: new Select(id);
	}

	public setInnerHTML(html: string) {
		this.safelySetInnerHTML(html);
	}
}