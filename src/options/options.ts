import browser from 'webextension-polyfill';

import { NullIfEmpty, SavedFields, IOptions } from './';
import { CONFIGURATION } from './configuration';
import { ValidatorConstructor, InputFieldValidator } from './validator';

import { Input, getElementById } from '../elements';

export const Fields = {
	async getSavedFields(): Promise<SavedFields> {
		const fieldsWithDefaultValues = Object.fromEntries(
			Object.entries(CONFIGURATION.FIELDS).map(([field, { defaultValue }]) => [field, defaultValue]),
		);

		return await <Promise<SavedFields>>browser.storage.local.get(fieldsWithDefaultValues);
	},

	async validateInput(elementId: string, Validator: ValidatorConstructor) {
		const inputValue = new Input(elementId).getValue() ?? null;

		// boolean values are always valid
		if (typeof inputValue === 'boolean') return inputValue;

		return await new Validator(elementId, inputValue).validate();
	},

	async getInputs(): Promise<Record<keyof SavedFields, NullIfEmpty<string>> | null> {
		const fieldEntries = Object.fromEntries(
			await Promise.all(
				Object.entries(CONFIGURATION.FIELDS).map(async ([field, { elementId, Validator }]) => {
					const validatedInput = (Validator)
						? await this.validateInput(elementId, Validator)
						: new Input(elementId).getValue();
					return [field, validatedInput];
				}),
			),
		);

		if (Object.values(fieldEntries).every(value => value !== InputFieldValidator.INVALID_INPUT)) return <Record<keyof SavedFields, NullIfEmpty<string>>>fieldEntries;

		return null;
	},
};

export const Options = {
	async getOptions(): Promise<IOptions> {
		const savedFields = await Fields.getSavedFields();

		return {
			timeZone: savedFields['timeZone'],
			popup: {
				displayJSONButton: savedFields['popup.displayJSONButton'],
			},
			options: {
				displayAdvanced: savedFields['options.displayAdvanced'],
			},
			canvas: {
				timeZone: savedFields['timeZone'],
				classNames: {
					breadcrumbs: savedFields['canvas.classNames.breadcrumbs'],
					assignment: savedFields['canvas.classNames.assignment'],
					title: savedFields['canvas.classNames.title'],
					availableDate: savedFields['canvas.classNames.availableDate'],
					availableStatus: savedFields['canvas.classNames.availableStatus'],
					dueDate: savedFields['canvas.classNames.dueDate'],
					dateElement: savedFields['canvas.classNames.dateElement'],
				},
				classValues: {
					courseCodeN: Number(savedFields['canvas.classValues.courseCodeN']),
					notAvailable: savedFields['canvas.classValues.notAvailable'],
				},
				selectors: {
					get courseCode() { return `.${savedFields['canvas.classNames.breadcrumbs']} li:nth-of-type(${savedFields['canvas.classValues.courseCodeN']}) span`; },
					get availableStatus() { return `.${savedFields['canvas.classNames.availableDate']} .${savedFields['canvas.classNames.availableStatus']}`; },
					get availableDate() { return `.${savedFields['canvas.classNames.availableDate']} .${savedFields['canvas.classNames.dateElement']}`; },
					get dueDate() { return `.${savedFields['canvas.classNames.dueDate']} .${savedFields['canvas.classNames.dateElement']}`; },
				},
				courseCodeOverrides: JSON.parse(savedFields['canvas.courseCodeOverrides']),
			},
			notion: {
				timeZone: savedFields['timeZone'],
				notionKey: savedFields['notion.notionKey'],
				databaseId: savedFields['notion.databaseId'],
				propertyNames: {
					name: savedFields['notion.propertyNames.name'],
					category: savedFields['notion.propertyNames.category'],
					course: savedFields['notion.propertyNames.course'],
					url: savedFields['notion.propertyNames.url'],
					status: savedFields['notion.propertyNames.status'],
					available: savedFields['notion.propertyNames.available'],
					due: savedFields['notion.propertyNames.due'],
					span: savedFields['notion.propertyNames.span'],
				},
				propertyValues: {
					categoryCanvas: savedFields['notion.propertyValues.categoryCanvas'],
					statusToDo: savedFields['notion.propertyValues.statusToDo'],
				},
				courseEmojis: JSON.parse(savedFields['notion.courseEmojis']),
			},
		};
	},

	// TODO: this shouldn't be exported
	async restoreOptions() {
		const savedFields = await Fields.getSavedFields();

		Object.entries(savedFields).forEach(([field, value]) => {
			const fieldElementId = CONFIGURATION.FIELDS[<keyof typeof savedFields>field].elementId;
			new Input(fieldElementId).setValue(value);
		});
	},

	// TODO: this shouldn't be exported
	async saveOptions() {
		const fieldEntries = await Fields.getInputs();

		if (fieldEntries) {
			await browser.storage.local.set(fieldEntries);

			if (saveButton) {
				saveButton.innerHTML = 'Saved!';

				setTimeout(() => {
					saveButton.innerHTML = 'Validate and Save';
				}, 1325);
			}

			this.restoreOptions();
		}
	},
};

document.addEventListener('DOMContentLoaded', Options.restoreOptions);


// show advanced options if appropriate
const advancedOptions = document.getElementById('advanced-options');
const advancedOptionsControl = document.getElementById(CONFIGURATION.FIELDS['options.displayAdvanced'].elementId);

function toggleAdvancedOptions(displayAdvanced: boolean) {
	if (!advancedOptions) return;
	(displayAdvanced)
		? advancedOptions.classList.remove('hidden')
		: advancedOptions.classList.add('hidden');
}

Options.getOptions().then(({ options: { displayAdvanced } }) => toggleAdvancedOptions(displayAdvanced));

// add event listener to advanced options toggle
advancedOptionsControl?.parentElement?.addEventListener('input', () => toggleAdvancedOptions((<HTMLInputElement>advancedOptionsControl)?.checked ?? false));

// validate fields on input
Object.values(CONFIGURATION.FIELDS).forEach(({ elementId, Validator, validateOn = 'input' }) => {
	if (Validator) document.getElementById(elementId)?.addEventListener(validateOn, () => Fields.validateInput(elementId, Validator));
});

// TODO: import Button class
const saveButton = document.getElementById('save-button');
saveButton?.addEventListener('click', Options.saveOptions);

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		Options.saveOptions();
	}
});