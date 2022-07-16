import { Input } from './Input';

export class Select extends Input {
	protected constructor(id: string) {
		super(id, 'select');
	}

	public static override getInstance<T extends string>(id: T): Select {
		if (!(Select.instances.get(id) instanceof Select)) {
			Select.instances.set(id, new Select(id));
		}

		return <Select>Select.instances.get(id);
	}

	public setInnerHTML(html: string) {
		this.safelySetInnerHTML(html);
	}
}