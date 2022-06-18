import browser from 'webextension-polyfill';

import { NullIfEmpty, SavedFields, Options } from './';
import { SupportedTypes, CONFIGURATION } from './configuration';
import { ValidatorConstructor, InputFieldValidator } from './validator';

async function getFields(): Promise<SavedFields> {
	const fieldsWithDefaultValues = Object.fromEntries(
		Object.entries(CONFIGURATION.FIELDS).map(([field, { defaultValue }]) => [field, defaultValue]),
	);

	return await <Promise<SavedFields>>browser.storage.local.get(fieldsWithDefaultValues);
}

export async function getOptions(): Promise<Options> {
	const savedFields = await getFields();

	return {
		timeZone: savedFields['timeZone'],
		popup: {
			displayJSONButton: savedFields['popup.displayJSONButton'],
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
}

async function restoreOptions() {
	const savedFields = await getFields();

	function setElementValueById(id: string, value: SupportedTypes) {
		const element = document.getElementById(id);

		if (!element || !(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
			return;
		}

		if (element instanceof HTMLInputElement && element.type === 'checkbox' && typeof value === 'boolean') {
			return element.checked = value;
		}

		if (typeof value === 'string') {
			return element.value = value;
		}

		throw new Error(`Failed to set unexpected value ${value} of type ${typeof value}`);
	}

	Object.entries(savedFields).forEach(([field, value]) => {
		const fieldElementId = CONFIGURATION.FIELDS[<keyof typeof savedFields>field].elementId;
		setElementValueById(fieldElementId, value);
	});
}

function getElementValueById(id: string): SupportedTypes | void {
	const element = document.getElementById(id);

	if (!element || !(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
		return;
	}

	if (element instanceof HTMLInputElement && element.type === 'checkbox') {
		return element.checked;
	}

	return element.value.trim() || null;
}

async function validateElementInput(elementId: string, Validator: ValidatorConstructor) {
	const inputValue = getElementValueById(elementId) ?? null;

	// boolean values are always valid
	if (typeof inputValue === 'boolean') return inputValue;

	return await new Validator(elementId, inputValue).validate();
}

async function getFieldInputs(): Promise<Record<keyof SavedFields, NullIfEmpty<string>> | null> {
	const fieldEntries = Object.fromEntries(
		await Promise.all(
			Object.entries(CONFIGURATION.FIELDS).map(async ([field, { elementId, Validator }]) => {
				const validatedInput = (Validator)
					? await validateElementInput(elementId, Validator)
					: getElementValueById(elementId);
				return [field, validatedInput];
			}),
		),
	);

	if (Object.values(fieldEntries).every(value => value !== InputFieldValidator.INVALID_INPUT)) return <Record<keyof SavedFields, NullIfEmpty<string>>>fieldEntries;

	return null;
}

async function saveOptions() {
	const fieldEntries = await getFieldInputs();

	if (fieldEntries) {
		await browser.storage.local.set(fieldEntries);

		if (saveButton) {
			saveButton.innerHTML = 'Saved!';

			setTimeout(() => {
				saveButton.innerHTML = 'Save';
			}, 1325);
		}

		restoreOptions();
	}
}

document.addEventListener('DOMContentLoaded', restoreOptions);

// validate fields on input
Object.values(CONFIGURATION.FIELDS).forEach(({ elementId, Validator, validateOn = 'input' }) => {
	if (Validator) document.getElementById(elementId)?.addEventListener(validateOn, () => validateElementInput(elementId, Validator));
});

const saveButton = document.getElementById('save-button');
if (saveButton) saveButton.addEventListener('click', saveOptions);

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		saveOptions();
	}
});