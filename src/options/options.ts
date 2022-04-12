import { NullIfEmpty, SavedFields, Options } from './';
import { InputValidator } from './validator';
import CONFIGURATION from './configuration';

async function getFields(): Promise<SavedFields> {
	const fieldsWithDefaultValues = Object.fromEntries(
		Object.entries(CONFIGURATION.FIELDS).map(([field, { defaultValue }]) => [field, defaultValue]),
	);

	return await <Promise<SavedFields>>chrome.storage.local.get(fieldsWithDefaultValues);
}

export async function getOptions(): Promise<Options> {
	const savedFields = await getFields();

	return {
		timeZone: savedFields['timeZone'],
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

	function setElementValueById(id: string, value: string) {
		const element = document.getElementById(id);
		if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) element.value = value;
	}

	Object.entries(savedFields).forEach(([field, value]) => {
		const fieldElementId = CONFIGURATION.FIELDS[<keyof typeof savedFields>field].elementId;
		setElementValueById(fieldElementId, value);
	});
}

async function saveOptions() {
	function getElementValueById(id: string): NullIfEmpty<string> | void {
		const element = document.getElementById(id);
		if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return element.value.trim() || null;
	}

	const fieldEntries = Object.fromEntries(
		Object.entries(CONFIGURATION.FIELDS).map(([field, { elementId, inputValidator }]) => {
			const inputValue = getElementValueById(elementId) ?? null;
			const validatedInput = new inputValidator(elementId, inputValue).validate();
			return [field, validatedInput];
		}),
	);

	if (Object.values(fieldEntries).some(value => value === InputValidator.INVALID_INPUT)) return;

	await chrome.storage.local.set(fieldEntries);

	if (saveButton) {
		saveButton.innerHTML = 'Saved!';

		setTimeout(() => {
			saveButton.innerHTML = 'Save';
		}, 1325);
	}

	restoreOptions();
}

document.addEventListener('DOMContentLoaded', restoreOptions);

// TODO: ensure required fields are checked on input
// TODO: maybe do this by running validateFields() on every input or something?
// const requiredFields = (<NodeListOf<HTMLInputElement>>document.querySelectorAll('input[required]'));
// requiredFields.forEach(element => element.addEventListener('input', () => new Input()));

const saveButton = document.getElementById('save-button');
if (saveButton) saveButton.addEventListener('click', saveOptions);

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		saveOptions();
	}
});