import { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';

import { SavedFields } from '.';
import { InputFieldValidator } from './validator';
import { CONFIGURATION, SupportedTypes } from './configuration';

import { Select } from '../elements';

import { valueof } from '../types/utils';

export class PropertySelect extends Select {
	private type: valueof<GetDatabaseResponse['properties']>['type'];
	protected fieldKey: keyof SavedFields;

	protected constructor(id: string, type: PropertySelect['type'], fieldKey: PropertySelect['fieldKey']) {
		super(id);

		this.type = type;
		this.fieldKey = fieldKey;
	}

	public static override getInstance<T extends string>(id: T, type?: PropertySelect['type'], fieldKey?: PropertySelect['fieldKey']): PropertySelect {
		if (!type) throw new Error('Argument type must be defined for class PropertySelect!');
		if (!fieldKey) throw new Error('Argument fieldKey must be defined for class PropertySelect!');

		if (!(PropertySelect.instances.get(id) instanceof PropertySelect)) {
			PropertySelect.instances.set(id, new PropertySelect(id, type, fieldKey));
		}

		return <PropertySelect>PropertySelect.instances.get(id);
	}

	public async populate(databasePromise: Promise<void | GetDatabaseResponse>, placeholder = 'Loading') {
		this.setInnerHTML(`<option selected disabled hidden>${placeholder}...</option>`);

		const database = await databasePromise;
		if (!database) return;

		const configured = (await Storage.getSavedFields())[this.fieldKey];

		const selectOptions = Object.values(database.properties)
			.filter(({ type }) => type === this.type)
			.reduce((html: string, { name }) => html + `
			<option value='${name}' ${(configured === name) ? 'selected' : ''}>
				${name}
			</option>
			`, (!(this.element instanceof HTMLSelectElement) || !this.element.required)
				? `
				<option value=''>❌ Exclude</option>
				`
				: '',
			);

		this.setInnerHTML(selectOptions ?? '');

		this.dispatchInputEvent();
	}
}

export class SelectPropertyValueSelect extends PropertySelect {
	private propertySelect: PropertySelect;

	protected constructor(id: string, type: PropertySelect['type'], fieldKey: PropertySelect['fieldKey'], getDatabaseId: () => Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT>, propertySelect: PropertySelect) {
		super(id, type, fieldKey);

		this.propertySelect = propertySelect;

		this.propertySelect.addEventListener('input', async () => {
			const databaseId = await getDatabaseId();
			if (typeof databaseId !== 'string') return;

			const accessToken = (await Storage.getNotionAuthorisation()).accessToken ?? await CONFIGURATION.FIELDS['notion.accessToken'].input.validate(true);

			if (!accessToken || typeof accessToken !== 'string') return;

			const databasePromise = NotionClient.getInstance({ auth: accessToken }).retrieveDatabase(databaseId);

			this.populate(databasePromise);
		});
	}

	public static override getInstance<T extends string>(id: T, type?: PropertySelect['type'], fieldKey?: PropertySelect['fieldKey'], getDatabaseId?: () => Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT>, propertySelect?: PropertySelect): PropertySelect {
		if (!type) throw new Error('Argument type must be defined for class SelectPropertyValueSelect!');
		if (!fieldKey) throw new Error('Argument fieldKey must be defined for class SelectPropertyValueSelect!');
		if (!getDatabaseId) throw new Error('Argument getDatabaseId must be defined for class SelectPropertyValueSelect!');
		if (!propertySelect) throw new Error('Argument propertySelect must be defined for class SelectPropertyValueSelect!');

		if (!(SelectPropertyValueSelect.instances.get(id) instanceof SelectPropertyValueSelect)) {
			SelectPropertyValueSelect.instances.set(id, new SelectPropertyValueSelect(id, type, fieldKey, getDatabaseId, propertySelect));
		}

		return <SelectPropertyValueSelect>SelectPropertyValueSelect.instances.get(id);
	}

	public override async populate(databasePromise: Promise<void | GetDatabaseResponse>, placeholder = 'Loading') {
		this.setInnerHTML(`<option selected disabled hidden>${placeholder}...</option>`);

		const database = await databasePromise;
		if (!database) return;

		const propertyName = this.propertySelect.getValue();

		if (typeof propertyName !== 'string') return;

		const configured = (await Storage.getSavedFields())[this.fieldKey];

		const property = Object.values(database.properties)
			.find(({ name, type }) => name === propertyName && type === 'select');

		if (!property || !('select' in property)) return;

		const selectOptions = property.select.options.reduce((html: string, { name }) => html + `
			<option value='${name}' ${(configured === name) ? 'selected' : ''}>
				${name}
			</option>
			`, (!(this.element instanceof HTMLSelectElement) || !this.element.required)
			? `
				<option value=''>❌ Exclude</option>
				`
			: '',
		);

		this.setInnerHTML(selectOptions ?? '');

		this.dispatchInputEvent();
	}
}