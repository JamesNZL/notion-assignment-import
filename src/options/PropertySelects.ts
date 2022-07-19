import { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';

import { ValidatorConstructor, typeGuards } from './validator';
import { CONFIGURATION, SupportedTypes } from './configuration';

import { Select } from '../elements';

import { SavedFields } from '../types/storage';
import { valueof } from '../types/utils';

export class PropertySelect extends Select {
	private type: valueof<GetDatabaseResponse['properties']>['type'];
	protected fieldKey: keyof SavedFields;

	protected constructor({ id, type, Validator, fieldKey }: {
		id: string,
		type: PropertySelect['type'],
		Validator?: ValidatorConstructor,
		fieldKey: PropertySelect['fieldKey'];
	}) {
		super({ id, type, Validator });

		this.type = type;
		this.fieldKey = fieldKey;
	}

	public static override getInstance<T extends string>({ id, type, Validator, fieldKey }: {
		id: T,
		type: PropertySelect['type'],
		Validator?: ValidatorConstructor,
		fieldKey: PropertySelect['fieldKey'];
	}): PropertySelect {
		if (!(PropertySelect.instances.get(id) instanceof PropertySelect)) {
			PropertySelect.instances.set(id, new PropertySelect({ id, type, Validator, fieldKey }));
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

	protected constructor({ id, type, Validator, fieldKey, getDatabaseId, propertySelect }: {
		id: string,
		type: PropertySelect['type'],
		Validator?: ValidatorConstructor;
		fieldKey: PropertySelect['fieldKey'],
		getDatabaseId: () => SupportedTypes,
		propertySelect: PropertySelect;
	}) {
		super({ id, type, Validator, fieldKey });

		this.propertySelect = propertySelect;

		this.propertySelect.addEventListener('input', async () => {
			const databaseId = getDatabaseId();
			if (!typeGuards.isUUIDv4(databaseId)) return console.log('bye!', { databaseId });

			const accessToken = (await Storage.getNotionAuthorisation()).accessToken ?? await CONFIGURATION.FIELDS['notion.accessToken'].input.validate(true);

			if (!accessToken || typeof accessToken !== 'string') return;

			const databasePromise = NotionClient.getInstance({ auth: accessToken }).retrieveDatabase(databaseId);

			this.populate(databasePromise);
		});
	}

	public static override getInstance<T extends string>({ id, type, Validator, fieldKey, getDatabaseId, propertySelect }: {
		id: T,
		type: PropertySelect['type'],
		Validator?: ValidatorConstructor;
		fieldKey: PropertySelect['fieldKey'],
		getDatabaseId: () => SupportedTypes,
		propertySelect: PropertySelect;
	}): SelectPropertyValueSelect {
		if (!(SelectPropertyValueSelect.instances.get(id) instanceof SelectPropertyValueSelect)) {
			SelectPropertyValueSelect.instances.set(id, new SelectPropertyValueSelect({ id, type, Validator, fieldKey, getDatabaseId, propertySelect }));
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