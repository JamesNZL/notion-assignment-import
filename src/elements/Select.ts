import { ValidatorConstructor } from '../options/validator';
import { Input } from './Input';

export class Select extends Input {
	protected constructor({ id, type, Validator }: {
		id: string,
		type: string,
		Validator?: ValidatorConstructor,
	}) {
		super({ id, type, Validator });
	}

	public static override getInstance<T extends string>({ id, type = 'string', Validator }: {
		id: T;
		type?: string,
		Validator?: ValidatorConstructor;
	}): Select {
		if (!(Select.instances.get(id) instanceof Select)) {
			Select.instances.set(id, new Select({ id, type, Validator }));
		}

		return <Select>Select.instances.get(id);
	}

	public setInnerHTML(html: string) {
		this.safelySetInnerHTML(html);
	}
}