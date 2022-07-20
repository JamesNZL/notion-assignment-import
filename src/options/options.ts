import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';
import { OAuth2 } from '../apis/oauth';

import { EmojiField, InputFieldValidator, RequiredNotionDatabaseIdField, RequiredStringField, StringField, typeGuards } from './validator';
import { CONFIGURATION, SupportedTypes } from './configuration';

import { Element, Button, Select, KeyValueGroup } from '../elements';
import { RestoreDefaultsButton, RestoreSavedButton } from './RestoreButtons';
import { PropertySelect, SelectPropertyValueSelect } from './PropertySelects';

import { SavedFields } from '../types/storage';
import { valueof } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface OptionsElements {
	restore: {
		timeZone: 'options-restore-timezone';
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
		courseCodesGroup: 'course-code-overrides-group';
		courseEmojisGroup: 'course-emojis-group';
	};
}

type OptionsRestoreButtonName = keyof OptionsElements['restore'];
type OptionsRestoreButtonId = valueof<OptionsElements['restore']>;
type OptionsButtonName = keyof OptionsElements['buttons'];
type OptionsButtonId = valueof<OptionsElements['buttons']>;
type OptionsSelectId = valueof<OptionsElements['selects']>;
type OptionsElementId = OptionsRestoreButtonId | OptionsButtonId | OptionsSelectId | valueof<OptionsElements['elements']>;

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
				Object.entries(CONFIGURATION.FIELDS).map(async ([field, { input }]) => [field, await input.validate(true)]),
			),
		);

		if (Object.values(fieldEntries).every(value => value !== InputFieldValidator.INVALID_INPUT)) return <Record<keyof SavedFields, SupportedTypes>>fieldEntries;

		return null;
	},
};

const AdvancedOptions = <const>{
	elements: Array.from(document.getElementsByClassName('advanced-options'))
		.map((element, index) => Element.getInstance({
			id: element.id || `advanced-options-${index}`,
			type: 'advanced options',
			element,
		})),
	control: CONFIGURATION.FIELDS['options.displayAdvanced'].input,

	show() {
		this.elements.forEach(element => element.show());
	},

	hide() {
		this.elements.forEach(element => element.hide());
	},

	toggle(display?: boolean) {
		(display ?? this.control.getValue())
			? this.show()
			: this.hide();
	},

	dispatchInputEvent() {
		this.control.dispatchInputEvent();
	},
};

const OAuth2Button = <const>{
	button: Button.getInstance<OptionsButtonId>({ id: 'notion-oauth' }),
	states: {
		UNAUTHORISED: 'Authorise with Notion',
		REAUTHORISE: 'Reauthorise with Notion',
		AUTHORISING: 'Authorising with Notion...',
		AUTHORISED: 'Authorised!',
	},
};

const DatabaseSelect = <const>{
	element: Select.getInstance<OptionsSelectId>({
		id: 'database-id',
		Validator: RequiredNotionDatabaseIdField,
	}),
	refreshButton: Button.getInstance<OptionsButtonId>({ id: 'refresh-database-select' }),
	propertySelects: {
		name: PropertySelect.getInstance<OptionsSelectId>({
			id: 'notion-property-name',
			type: 'title',
			Validator: RequiredStringField,
			fieldKey: 'notion.propertyNames.name',
		}),
		category: PropertySelect.getInstance<OptionsSelectId>({
			id: 'notion-property-category',
			type: 'select',
			Validator: StringField,
			fieldKey: 'notion.propertyNames.category',
		}),
		course: PropertySelect.getInstance<OptionsSelectId>({
			id: 'notion-property-course',
			type: 'select',
			Validator: StringField,
			fieldKey: 'notion.propertyNames.course',
		}),
		url: PropertySelect.getInstance<OptionsSelectId>({
			id: 'notion-property-url',
			type: 'url',
			Validator: StringField,
			fieldKey: 'notion.propertyNames.url',
		}),
		available: PropertySelect.getInstance<OptionsSelectId>({
			id: 'notion-property-available',
			type: 'date',
			Validator: StringField,
			fieldKey: 'notion.propertyNames.available',
		}),
		due: PropertySelect.getInstance<OptionsSelectId>({
			id: 'notion-property-due',
			type: 'date',
			Validator: StringField,
			fieldKey: 'notion.propertyNames.due',
		}),
		span: PropertySelect.getInstance<OptionsSelectId>({
			id: 'notion-property-span',
			type: 'date',
			Validator: StringField,
			fieldKey: 'notion.propertyNames.span',
		}),
	},
	propertyValueSelects: {
		get categoryCanvas() {
			return SelectPropertyValueSelect.getInstance<OptionsSelectId>({
				id: 'notion-category-canvas',
				type: 'select',
				Validator: StringField,
				fieldKey: 'notion.propertyValues.categoryCanvas',
				getDatabaseId: DatabaseSelect.element.getValue.bind(DatabaseSelect.element),
				propertySelect: DatabaseSelect.propertySelects.category,
			});
		},
	},

	show() {
		this.element.show();
		this.refreshButton.show();
	},

	async populate(placeholder = 'Loading') {
		if (!this.element) return;

		const accessToken = (await Storage.getNotionAuthorisation()).accessToken ?? await CONFIGURATION.FIELDS['notion.accessToken'].input.validate(true);

		if (!accessToken || typeof accessToken !== 'string') return;

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
	oauth: OAuth2Button.button,
	refreshDatabaseSelect: DatabaseSelect.refreshButton,
	save: Button.getInstance<OptionsButtonId>({ id: 'save-button' }),
	restore: {
		timeZone: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>({
			id: 'options-restore-timezone',
			restoreKeys: [
				'timeZone',
			],
		}),
		canvasCourseCodes: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>({
			id: 'options-restore-canvas-course-codes',
			restoreKeys: [
				'canvas.courseCodeOverrides',
			],
		}),
		notionPropertyNames: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>({
			id: 'options-restore-notion-property-names',
			restoreKeys: [
				'notion.propertyNames.name',
				'notion.propertyNames.category',
				'notion.propertyNames.course',
				'notion.propertyNames.url',
				'notion.propertyNames.available',
				'notion.propertyNames.due',
				'notion.propertyNames.span',
			],
		}),
		notionPropertyValues: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>({
			id: 'options-restore-notion-property-values',
			restoreKeys: [
				'notion.propertyValues.categoryCanvas',
			],
		}),
		notionEmojis: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>({
			id: 'options-restore-notion-emojis',
			restoreKeys: [
				'notion.courseEmojis',
			],
		}),
		all: RestoreDefaultsButton.getInstance<OptionsRestoreButtonId>({
			id: 'options-restore-all',
			restoreKeys: <(keyof SavedFields)[]>Object.keys(CONFIGURATION.FIELDS),
		}),
		undo: RestoreSavedButton.getInstance<OptionsRestoreButtonId>({
			id: 'options-undo-all',
			restoreKeys: <(keyof SavedFields)[]>Object.keys(CONFIGURATION.FIELDS),
			restoreOptions: OptionsPage.restoreOptions.bind(OptionsPage),
		}),
	},
};

/*
 *
 * Initial Load
 *
 */

/*
 * Display Theme
 */

Storage.getOptions().then(({ extension: { displayTheme }, options: { displayAdvanced } }) => {
	// set display theme
	if (displayTheme) document.documentElement.classList.add(`${displayTheme}-mode`);

	// show advanced options if appropriate
	AdvancedOptions.toggle(displayAdvanced);
});

/*
 * Toggle Dependents
 */

// toggle dependents if appropriate
Object.values(CONFIGURATION.FIELDS).forEach(({ input, dependents }) => {
	if (!dependents) return;
	input.toggleDependents(dependents);
});

/*
 * OAuth
 */

if (!OAuth2.isIdentitySupported) {
	buttons.oauth.hide();
	CONFIGURATION.FIELDS['notion.accessToken'].input.show();
}

Storage.getNotionAuthorisation().then(async ({ accessToken }) => {
	if (!accessToken || !await NotionClient.getInstance({ auth: accessToken }).validateToken()) {
		buttons.oauth.setDefaultLabel(OAuth2Button.states.UNAUTHORISED);
		return buttons.oauth.resetHTML();
	}

	buttons.oauth.setDefaultLabel(OAuth2Button.states.REAUTHORISE);
	buttons.oauth.resetHTML();

	DatabaseSelect.populate();
	DatabaseSelect.show();
});

/*
 * DOMContentLoaded
 */

document.addEventListener('DOMContentLoaded', async () => {
	KeyValueGroup.getInstance<OptionsElementId>({ id: 'course-code-overrides-group' })
		.setPlaceholders({
			key: '121 UoA',
			value: 'COURSE 121',
		});

	KeyValueGroup.getInstance<OptionsElementId>({ id: 'course-emojis-group' })
		.setPlaceholders({
			key: 'COURSE 121',
			value: '👨‍💻',
		})
		.setValueValidator(EmojiField)
		.setValueValidateOn('input');

	await OptionsPage.restoreOptions();

	Object.values(buttons.restore).forEach(button => button.toggle());
});

/*
 * Warn If Unsaved Changes on Exit
 */

window.addEventListener('beforeunload', event => {
	if (buttons.restore.undo.isSelfHidden) return;

	event.preventDefault();
	return event.returnValue = 'Changes you made may not be saved.';
});

/*
 *
 * Input Listeners
 *
 */

// add event listener to display theme toggle
CONFIGURATION.FIELDS['extension.displayTheme'].input.addEventListener('input', () => {
	const displayTheme = CONFIGURATION.FIELDS['extension.displayTheme'].input.getValue();

	document.documentElement.classList.forEach(token => {
		if (!/-mode/.test(token)) return;
		document.documentElement.classList.remove(token);
	});

	if (!displayTheme) return;

	document.documentElement.classList.add(`${displayTheme}-mode`);
});

// add event listener to advanced options toggle
AdvancedOptions.control?.addEventListener('input', AdvancedOptions.toggle.bind(AdvancedOptions, undefined));

// add event listener to bind accessToken input field to authorisation button
CONFIGURATION.FIELDS['notion.accessToken'].input.addEventListener('input', async () => {
	const validatedInput = await CONFIGURATION.FIELDS['notion.accessToken'].input.validate();

	if (validatedInput === InputFieldValidator.INVALID_INPUT) {
		buttons.oauth.setDefaultLabel(OAuth2Button.states.UNAUTHORISED);
		return buttons.oauth.resetHTML();
	}

	DatabaseSelect.populate();

	buttons.oauth.setDefaultLabel(OAuth2Button.states.REAUTHORISE);

	if (buttons.oauth.getButtonLabel() !== OAuth2Button.states.AUTHORISING) {
		return buttons.oauth.resetHTML();
	}

	buttons.oauth.setButtonLabel(OAuth2Button.states.AUTHORISED);
	buttons.oauth.resetHTML(1325);
});

// validate fields on input
Object.values(CONFIGURATION.FIELDS)
	.forEach(({ input, validateOn = 'input', dependents = [] }) => {
		input.addEventListener(validateOn, input.validate.bind(input, undefined));

		if (!dependents.length) return;

		input.addEventListener('input', input.toggleDependents.bind(input, dependents));
	});

Object.values(buttons.restore).forEach(button => button.addEventListener('click', button.restore.bind(button)));

DatabaseSelect.element.addEventListener('input', async () => {
	const databaseId = DatabaseSelect.element.getValue();
	if (!typeGuards.isUUIDv4(databaseId)) return;

	const accessToken = (await Storage.getNotionAuthorisation()).accessToken ?? await CONFIGURATION.FIELDS['notion.accessToken'].input.validate(true);

	if (!accessToken || typeof accessToken !== 'string') return;

	const databasePromise = NotionClient.getInstance({ auth: accessToken }).retrieveDatabase(databaseId);

	[
		...Object.values(DatabaseSelect.propertySelects),
		...Object.values(DatabaseSelect.propertyValueSelects),
	]
		.forEach(select => select.populate(databasePromise));
});

buttons.oauth.addEventListener('click', async () => {
	if (!OAuth2.isIdentitySupported) return;

	buttons.oauth.setButtonLabel(OAuth2Button.states.AUTHORISING);

	const success = await OAuth2.authorise();

	if (!success) return buttons.oauth.resetHTML();

	const { accessToken } = await Storage.getNotionAuthorisation();
	CONFIGURATION.FIELDS['notion.accessToken'].input.setValue(accessToken ?? null);
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

/*
 *
 * Konami
 *
 */

const Konami = {
	pattern: <const>['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
	currentIndex: 0,

	handler(event: KeyboardEvent) {
		if (!(<readonly string[]>this.pattern).includes(event.key) || event.key !== this.pattern[this.currentIndex]) {
			return this.currentIndex = 0;
		}

		this.currentIndex++;

		if (this.currentIndex !== this.pattern.length) return;

		this.currentIndex = 0;
		AdvancedOptions.control.setValue(true);
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