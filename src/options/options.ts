import { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';
import { OAuth2 } from '../apis/oauth';

import { SavedFields } from './';
import { EmojiField, InputFieldValidator } from './validator';
import { CONFIGURATION, SupportedTypes } from './configuration';

import { Element, Button, Input, Select, KeyValueGroup } from '../elements';

import { valueof } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface OptionsElements {
	restore: {
		timeZone: 'options-restore-timezone';
		canvasClassNames: 'options-restore-canvas-class-names';
		canvasClassValues: 'options-restore-canvas-class-values';
		canvasCourseCodes: 'options-restore-canvas-course-codes';
		notionPropertyNames: 'options-restore-notion-property-names';
		notionPropertyValues: 'options-restore-notion-property-values';
		notionEmojis: 'options-restore-notion-emojis';
		all: 'options-restore-all';
		undo: 'options-undo-all';
	};
	buttons: {
		oauth: 'notion-oauth';
		refreshDatabaseSelect: 'refresh-database-select';
		save: 'save-button';
	};
	selects: {
		databaseId: 'database-id';
		nameProperty: 'notion-property-name';
		categoryProperty: 'notion-property-category';
		courseProperty: 'notion-property-course';
		urlProperty: 'notion-property-url';
		availableProperty: 'notion-property-available';
		dueProperty: 'notion-property-due';
		spanProperty: 'notion-property-span';
		categoryCanvas: 'notion-category-canvas';
	};
	elements: {
		advancedOptions: 'advanced-options';
		advancedOptionsSegmentedControl: 'display-advanced-options';
		advancedOptionsHide: 'hide-advanced-options';
		courseCodesGroup: 'course-code-overrides-group';
		courseCodesCanvas: 'course-code-overrides-canvas';
		courseCodesNotion: 'course-code-overrides-notion';
		courseCodesValue: 'course-code-overrides';
		courseEmojisGroup: 'course-emojis-group';
		courseEmojisCodes: 'course-emojis-codes';
		courseEmojisEmojis: 'course-emojis-emojis';
		courseEmojisValue: 'course-emojis';
	};
}

type OptionsRestoreButtonName = keyof OptionsElements['restore'];
type OptionsRestoreButtonId = valueof<OptionsElements['restore']>;
type OptionsButtonName = keyof OptionsElements['buttons'];
type OptionsButtonId = valueof<OptionsElements['buttons']>;
type OptionsSelectId = valueof<OptionsElements['selects']>;
type OptionsElementId = OptionsRestoreButtonId | OptionsButtonId | OptionsSelectId | valueof<OptionsElements['elements']>;

class RestoreDefaultsButton extends Button {
	protected static override instances: Record<string, RestoreDefaultsButton> = {};

	protected restoreKeys: (keyof SavedFields)[];
	protected inputs: Partial<Record<keyof SavedFields, Input>>;

	protected constructor(id: string, restoreKeys: (keyof SavedFields)[]) {
		super(id);

		this.restoreKeys = restoreKeys;
		this.inputs = Object.fromEntries(
			this.restoreKeys.map(key => [key, CONFIGURATION.FIELDS[key].input]),
		);

		Object.values(this.inputs).forEach(input => input.addEventListener('input', this.toggle.bind(this)));
	}

	public static override getInstance<T extends string>(id: T, restoreKeys?: (keyof SavedFields)[]): RestoreDefaultsButton {
		if (!restoreKeys) throw new Error('Argument restoreKeys must be defined for class Restore(Defauts|Saved)Button!');

		return RestoreDefaultsButton.instances[id] = (RestoreDefaultsButton.instances[id] instanceof RestoreDefaultsButton)
			? RestoreDefaultsButton.instances[id]
			: new this(id, restoreKeys);
	}

	public toggle() {
		(Object.entries(this.inputs).some(([key, input]) => !input.isHidden() && input.getValue() !== CONFIGURATION.FIELDS[<keyof SavedFields>key].defaultValue))
			? this.show()
			: this.hide();
	}

	protected async restoreInputs() {
		Object.entries(this.inputs).forEach(([key, input]) => {
			const { defaultValue } = CONFIGURATION.FIELDS[<keyof SavedFields>key];
			input.setValue(defaultValue);
		});
	}

	public async restore() {
		await this.restoreInputs();

		this.toggle();

		if (this.restoreKeys.includes('options.displayAdvanced')) {
			AdvancedOptions.dispatchInputEvent();
		}
	}
}

class RestoreSavedButton extends RestoreDefaultsButton {
	public override async toggle() {
		const savedFields = await Storage.getSavedFields();

		(Object.entries(this.inputs).some(([key, input]) => !input.isHidden() && input.getValue() !== savedFields[<keyof SavedFields>key]))
			? this.show()
			: this.hide();
	}

	protected override async restoreInputs() {
		await OptionsPage.restoreOptions();

		Object.values(this.inputs).forEach(input => input.dispatchInputEvent());
	}
}

const OptionsPage = <const>{
	async restoreOptions() {
		const savedFields = await Storage.getSavedFields();

		Object.entries(savedFields).forEach(([field, value]) => {
			const { input, defaultValue } = CONFIGURATION.FIELDS[<keyof typeof savedFields>field];

			input.setValue(value, false);
			input.setPlaceholder?.(defaultValue);
		});

		Object.values(buttons.restore).forEach(button => button.toggle());
	},

	async saveOptions() {
		const fieldEntries = await OptionsPage.getInputs();

		if (!fieldEntries) return;

		await Storage.setSavedFields(fieldEntries);

		buttons.save.setButtonLabel('Saved!');
		buttons.save.resetHTML(1325);

		this.restoreOptions();
	},

	async getInputs(): Promise<Record<keyof SavedFields, SupportedTypes> | null> {
		const fieldEntries = Object.fromEntries(
			await Promise.all(
				Object.entries(CONFIGURATION.FIELDS).map(async ([field, { input }]) => [field, await input.validate()]),
			),
		);

		if (Object.values(fieldEntries).every(value => value !== InputFieldValidator.INVALID_INPUT)) return <Record<keyof SavedFields, SupportedTypes>>fieldEntries;

		return null;
	},
};

const AdvancedOptions = <const>{
	element: Element.getInstance<OptionsElementId>('advanced-options', 'advanced options'),
	control: Element.getInstance<OptionsElementId>('display-advanced-options', 'advanced options control'),
	showInput: CONFIGURATION.FIELDS['options.displayAdvanced'].input,
	hideInput: Input.getInstance<OptionsElementId>('hide-advanced-options'),

	show() {
		this.element.removeClass('hidden');
	},

	hide() {
		this.element.addClass('hidden');
		this.hideInput.setValue(true, false);
	},

	toggle(display: boolean) {
		(display)
			? this.show()
			: this.hide();
	},

	dispatchInputEvent() {
		this.control.dispatchEvent(new Event('input', { bubbles: true }));
	},
};

class PropertySelect extends Select {
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

		return PropertySelect.instances[id] = (PropertySelect.instances[id] instanceof PropertySelect)
			? <PropertySelect>PropertySelect.instances[id]
			: new PropertySelect(id, type, fieldKey);
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

class SelectPropertyValueSelect extends PropertySelect {
	private propertySelect: PropertySelect;

	protected constructor(id: string, type: PropertySelect['type'], fieldKey: PropertySelect['fieldKey'], propertySelect: PropertySelect) {
		super(id, type, fieldKey);

		this.propertySelect = propertySelect;

		this.propertySelect.addEventListener('input', async () => {
			const databaseId = DatabaseSelect.element.getValue();
			if (typeof databaseId !== 'string') return;

			const { accessToken } = await Storage.getNotionAuthorisation();
			if (!accessToken) return;

			const databasePromise = NotionClient.getInstance({ auth: accessToken }).retrieveDatabase(databaseId);

			this.populate(databasePromise);
		});
	}

	public static override getInstance<T extends string>(id: T, type?: PropertySelect['type'], fieldKey?: PropertySelect['fieldKey'], propertySelect?: PropertySelect): PropertySelect {
		if (!type) throw new Error('Argument type must be defined for class SelectPropertyValueSelect!');
		if (!fieldKey) throw new Error('Argument fieldKey must be defined for class SelectPropertyValueSelect!');
		if (!propertySelect) throw new Error('Argument propertySelect must be defined for class SelectPropertyValueSelect!');

		return SelectPropertyValueSelect.instances[id] = (SelectPropertyValueSelect.instances[id] instanceof SelectPropertyValueSelect)
			? <SelectPropertyValueSelect>SelectPropertyValueSelect.instances[id]
			: new SelectPropertyValueSelect(id, type, fieldKey, propertySelect);
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

const DatabaseSelect = <const>{
	element: Select.getInstance<OptionsSelectId>('database-id'),
	refreshButton: Button.getInstance<OptionsButtonId>('refresh-database-select'),
	propertySelects: {
		name: PropertySelect.getInstance<OptionsSelectId>('notion-property-name', 'title', 'notion.propertyNames.name'),
		category: PropertySelect.getInstance<OptionsSelectId>('notion-property-category', 'select', 'notion.propertyNames.category'),
		course: PropertySelect.getInstance<OptionsSelectId>('notion-property-course', 'select', 'notion.propertyNames.course'),
		url: PropertySelect.getInstance<OptionsSelectId>('notion-property-url', 'url', 'notion.propertyNames.url'),
		available: PropertySelect.getInstance<OptionsSelectId>('notion-property-available', 'date', 'notion.propertyNames.available'),
		due: PropertySelect.getInstance<OptionsSelectId>('notion-property-due', 'date', 'notion.propertyNames.due'),
		span: PropertySelect.getInstance<OptionsSelectId>('notion-property-span', 'date', 'notion.propertyNames.span'),
	},
	propertyValueSelects: {
		get categoryCanvas() {
			return SelectPropertyValueSelect.getInstance<OptionsSelectId>('notion-category-canvas', 'select', 'notion.propertyValues.categoryCanvas', DatabaseSelect.propertySelects.category);
		},
	},

	show() {
		this.element.show();
	},

	async populate(placeholder = 'Loading') {
		if (!this.element) return;

		const { accessToken } = await Storage.getNotionAuthorisation();
		if (!accessToken) return;

		this.element.setInnerHTML(`<option selected disabled hidden>${placeholder}...</option>`);

		const notionClient = NotionClient.getInstance({ auth: accessToken });

		const databases = await notionClient.searchShared({
			filter: {
				property: 'object',
				value: 'database',
			},
		}, {
			cache: false,
			force: true,
		});

		const { notion: { databaseId } } = await Storage.getOptions();

		const selectOptions = databases?.results.reduce((html: string, database) => html + `
			<option value='${database.id}' ${(databaseId === database.id) ? 'selected' : ''}>
				${NotionClient.resolveTitle(database) ?? 'Untitled'}
			</option>
			`, '');

		this.element.setInnerHTML(selectOptions ?? '');

		this.element.dispatchInputEvent();
	},
};

const buttons: {
	[K in OptionsButtonName]: Button;
} & {
	restore: {
		[K in OptionsRestoreButtonName]: RestoreDefaultsButton;
	};
} = <const>{
	oauth: Button.getInstance<OptionsButtonId>('notion-oauth'),
	refreshDatabaseSelect: DatabaseSelect.refreshButton,
	save: Button.getInstance<OptionsButtonId>('save-button'),
	restore: {
		timeZone: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-timezone',
			[
				'timeZone',
			],
		),
		canvasClassNames: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-canvas-class-names',
			[
				'canvas.classNames.breadcrumbs',
				'canvas.classNames.assignment',
				'canvas.classNames.title',
				'canvas.classNames.availableDate',
				'canvas.classNames.availableStatus',
				'canvas.classNames.dueDate',
				'canvas.classNames.dateElement',
			],
		),
		canvasClassValues: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-canvas-class-values',
			[
				'canvas.classValues.courseCodeN',
				'canvas.classValues.notAvailable',
			],
		),
		canvasCourseCodes: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-canvas-course-codes',
			[
				'canvas.courseCodeOverrides',
			],
		),
		notionPropertyNames: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-notion-property-names',
			[
				'notion.propertyNames.name',
				'notion.propertyNames.category',
				'notion.propertyNames.course',
				'notion.propertyNames.url',
				'notion.propertyNames.available',
				'notion.propertyNames.due',
				'notion.propertyNames.span',
			],
		),
		notionPropertyValues: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-notion-property-values',
			[
				'notion.propertyValues.categoryCanvas',
			],
		),
		notionEmojis: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-notion-emojis',
			[
				'notion.courseEmojis',
			],
		),
		all: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>('options-restore-all',
			<(keyof SavedFields)[]>Object.keys(CONFIGURATION.FIELDS),
		),
		undo: RestoreSavedButton.getInstance<OptionsRestoreButtonId>('options-undo-all',
			<(keyof SavedFields)[]>Object.keys(CONFIGURATION.FIELDS),
		),
	},
};

// show advanced options if appropriate
Storage.getOptions().then(({ options: { displayAdvanced } }) => AdvancedOptions.toggle(displayAdvanced));

// toggle dependents if appropriate
Object.values(CONFIGURATION.FIELDS).forEach(({ input, dependents }) => {
	if (!dependents) return;
	input.toggleDependents(dependents);
});

Storage.getNotionAuthorisation().then(async ({ accessToken }) => {
	if (!accessToken || !await NotionClient.getInstance({ auth: accessToken }).validateToken()) {
		buttons.oauth.setDefaultLabel('Authorise with Notion');
		return buttons.oauth.resetHTML();
	}

	buttons.oauth.setDefaultLabel('Reauthorise with Notion');
	buttons.oauth.resetHTML();

	DatabaseSelect.populate();
	DatabaseSelect.show();
});

document.addEventListener('DOMContentLoaded', async () => {
	KeyValueGroup.getInstance<OptionsElementId>('course-code-overrides-group', 'course-code-overrides-canvas', 'course-code-overrides-notion')
		.setPlaceholders({
			key: '121 UoA',
			value: 'COURSE 121',
		});

	KeyValueGroup.getInstance<OptionsElementId>('course-emojis-group', 'course-emojis-codes', 'course-emojis-emojis')
		.setPlaceholders({
			key: 'COURSE 121',
			value: '👨‍💻',
		})
		.setValueValidator(EmojiField)
		.setValueValidateOn('input');

	await OptionsPage.restoreOptions();

	Object.values(buttons.restore).forEach(button => button.toggle());
});

// add event listener to advanced options toggle
AdvancedOptions.control?.addEventListener('input', () => {
	AdvancedOptions.toggle(Boolean(AdvancedOptions.showInput.getValue()));

	AdvancedOptions.showInput.dispatchInputEvent(false);
	AdvancedOptions.hideInput.dispatchInputEvent(false);
});

// validate fields on input
Object.values(CONFIGURATION.FIELDS)
	.forEach(({ input, validateOn = 'input', dependents = [] }) => {
		input.addEventListener(validateOn, input.validate.bind(input));

		if (!dependents.length) return;

		input.addEventListener('input', () => input.toggleDependents(dependents));
	});

Object.values(buttons.restore).forEach(button => button.addEventListener('click', button.restore.bind(button)));

DatabaseSelect.element.addEventListener('input', async () => {
	const databaseId = DatabaseSelect.element.getValue();
	if (typeof databaseId !== 'string') return;

	const { accessToken } = await Storage.getNotionAuthorisation();
	if (!accessToken) return;

	const databasePromise = NotionClient.getInstance({ auth: accessToken }).retrieveDatabase(databaseId);

	[
		...Object.values(DatabaseSelect.propertySelects),
		...Object.values(DatabaseSelect.propertyValueSelects),
	]
		.forEach(select => select.populate(databasePromise));
});

buttons.oauth.addEventListener('click', async () => {
	buttons.oauth.setButtonLabel('Authorising with Notion...');

	// TODO: ensure browser.identity
	const success = await OAuth2.authorise();

	if (!success) return buttons.oauth.resetHTML();

	buttons.oauth.setButtonLabel('Authorised!');
	buttons.oauth.setDefaultLabel('Reauthorise with Notion');
	buttons.oauth.resetHTML(1325);

	Storage.clearDatabaseId();
	DatabaseSelect.populate();
	DatabaseSelect.show();
});

buttons.refreshDatabaseSelect.addEventListener('click', async () => {
	buttons.refreshDatabaseSelect.setButtonLabel('Refreshing...');

	await DatabaseSelect.populate('Refreshing');

	buttons.refreshDatabaseSelect.setButtonLabel('Refreshed!');
	buttons.refreshDatabaseSelect.resetHTML(1325);
});

buttons.save.addEventListener('click', OptionsPage.saveOptions.bind(OptionsPage));

document.addEventListener('keydown', keyEvent => {
	if (!keyEvent.ctrlKey || keyEvent.key !== 's') return;

	keyEvent.preventDefault();
	OptionsPage.saveOptions();
});

const Konami = {
	pattern: <const>['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
	currentIndex: 0,

	handler(event: KeyboardEvent) {
		if (!(<readonly string[]>this.pattern).includes(event.key) || event.key !== this.pattern[this.currentIndex]) {
			return this.currentIndex = 0;
		}

		this.currentIndex++;

		if (this.currentIndex !== this.pattern.length || !AdvancedOptions.control) return;

		this.currentIndex = 0;
		AdvancedOptions.showInput.setValue(true);
	},
};

document.addEventListener('keydown', event => Konami.handler(event), false);

// ! alert for removal of status select property support
Storage.getStorageKey('notion.propertyNames.status', false).then(value => {
	if (value === false) return;

	const deleteProperty = confirm('Prior support for a \'Status\' Notion property has been removed.\n\nPlease update your database to use the newly-released Notion built-in Status property.\n\nFor more information, visit the GitHub Repository.\n\nClick \'OK\' to hide this message forever.');

	if (!deleteProperty) return;

	Storage.clearStorageKey('notion.propertyNames.status');
});