import { NullIfEmpty, SavedFields, Options } from './';
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

function missingRequiredFields() {
	if (saveButton) {
		if (Object.values(requiredFields).some(input => !input.value)) {
			saveButton.innerHTML = 'Missing required fields!';
			saveButton.classList.add('red');
			saveButton.classList.remove('green');
			return true;
		}
		else {
			saveButton.innerHTML = 'Save';
			saveButton.classList.add('green');
			saveButton.classList.remove('red');
			return false;
		}
	}
}

async function saveOptions() {
	if (missingRequiredFields()) return;

	if (saveButton) {
		saveButton.innerHTML = 'Saved!';

		setTimeout(() => {
			saveButton.innerHTML = 'Save';
		}, 1325);
	}

	function getElementValueById(id: string): NullIfEmpty<string> | void {
		const element = document.getElementById(id);
		if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return element.value || null;
	}

	const fieldElementValues = Object.fromEntries(
		Object.entries(CONFIGURATION.FIELDS).map(([field, { elementId }]) => [field, getElementValueById(elementId)]),
	);

	await chrome.storage.local.set(fieldElementValues);
}

function verifyRequiredField(this: HTMLInputElement) {
	missingRequiredFields();

	if (!this.value) {
		this.classList.add('missing-required');
	}
	else {
		this.classList.remove('missing-required');
	}
}

document.addEventListener('DOMContentLoaded', restoreOptions);

const requiredFields = (<NodeListOf<HTMLInputElement>>document.querySelectorAll('input[required]'));
requiredFields.forEach(element => element.addEventListener('input', verifyRequiredField));

const saveButton = document.getElementById('save-button');
if (saveButton) saveButton.addEventListener('click', saveOptions);

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		saveOptions();
	}
});