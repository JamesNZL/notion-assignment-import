import { EmojiRequest, TimeZoneRequest } from '../api-handlers/notion';
import CONFIGURATION from './configuration';

import { ModifyDeep } from '../types/utils';

type NeverEmpty<T extends string> = T extends '' ? never : T;
type NullIfEmpty<T extends string | null> = (T extends '' ? null : T) | null;

// TODO: enforce null if empty on save

interface RequiredFields {
	'canvas.classNames.breadcrumbs': NeverEmpty<string>;
	'canvas.classNames.assignment': NeverEmpty<string>;
	'canvas.classNames.title': NeverEmpty<string>;
	'canvas.classNames.availableDate': NeverEmpty<string>;
	'canvas.classNames.availableStatus': NeverEmpty<string>;
	'canvas.classNames.dueDate': NeverEmpty<string>;
	'canvas.classNames.dateElement': NeverEmpty<string>;
	'canvas.classValues.courseCodeN': NeverEmpty<string>,
	'canvas.classValues.notAvailable': NeverEmpty<string>;
	// initialised to null, but can never be cleared once set
	'notion.notionKey': NullIfEmpty<string>;
	'notion.databaseId': NullIfEmpty<string>;
}

interface OptionalFields {
	// TODO: validate before save
	'timeZone': NullIfEmpty<NonNullable<TimeZoneRequest>>;
	'canvas.courseCodeOverrides': NullIfEmpty<string>;
	'notion.propertyNames.name': NullIfEmpty<string>;
	'notion.propertyNames.category': NullIfEmpty<string>;
	'notion.propertyNames.course': NullIfEmpty<string>;
	'notion.propertyNames.url': NullIfEmpty<string>;
	'notion.propertyNames.status': NullIfEmpty<string>;
	'notion.propertyNames.available': NullIfEmpty<string>;
	'notion.propertyNames.due': NullIfEmpty<string>;
	'notion.propertyNames.span': NullIfEmpty<string>;
	'notion.propertyValues.categoryCanvas': NullIfEmpty<string>;
	'notion.propertyValues.statusToDo': NullIfEmpty<string>;
	'notion.courseEmojis': NullIfEmpty<string>;
}

export type SavedFields = RequiredFields & OptionalFields;

export type SavedOptions = {
	timeZone: OptionalFields['timeZone'];
	canvas: {
		classNames: {
			breadcrumbs: RequiredFields['canvas.classNames.breadcrumbs'];
			assignment: RequiredFields['canvas.classNames.assignment'];
			title: RequiredFields['canvas.classNames.title'];
			availableDate: RequiredFields['canvas.classNames.availableDate'];
			availableStatus: RequiredFields['canvas.classNames.availableStatus'];
			dueDate: RequiredFields['canvas.classNames.dueDate'];
			dateElement: RequiredFields['canvas.classNames.dateElement'];
		},
		classValues: {
			courseCodeN: RequiredFields['canvas.classValues.courseCodeN'];
			notAvailable: RequiredFields['canvas.classValues.notAvailable'];
		},
		courseCodeOverrides: OptionalFields['canvas.courseCodeOverrides'];
	},
	notion: {
		notionKey: RequiredFields['notion.notionKey'];
		databaseId: RequiredFields['notion.databaseId'];
		propertyNames: {
			name: OptionalFields['notion.propertyNames.name'];
			category: OptionalFields['notion.propertyNames.category'];
			course: OptionalFields['notion.propertyNames.course'];
			url: OptionalFields['notion.propertyNames.url'];
			status: OptionalFields['notion.propertyNames.status'];
			available: OptionalFields['notion.propertyNames.available'];
			due: OptionalFields['notion.propertyNames.due'];
			span: OptionalFields['notion.propertyNames.span'];
		},
		propertyValues: {
			categoryCanvas: OptionalFields['notion.propertyValues.categoryCanvas'];
			statusToDo: OptionalFields['notion.propertyValues.statusToDo'];
		},
		courseEmojis: OptionalFields['notion.courseEmojis'];
	},
};

export type Options = ModifyDeep<SavedOptions, {
	canvas: {
		timeZone: OptionalFields['timeZone'];
		classValues: {
			// TODO: validate before save
			courseCodeN: number;
		};
		selectors: {
			courseCode: NeverEmpty<string>;
			availableStatus: NeverEmpty<string>;
			availableDate: NeverEmpty<string>;
			dueDate: NeverEmpty<string>;
		};
		courseCodeOverrides: Record<string, string>;
	};
	notion: {
		timeZone: OptionalFields['timeZone'];
		// TODO: validate before save
		courseEmojis: Record<string, EmojiRequest>;
	};
}>;

// TODO

/* function flattenOptions(options): Record<string, string | number | null> {

}

export async function getOptionsFromStorage(): Promise<Options> {
	await chrome.storage.local.get({
		breadcrumbs: 'ic-app-crumbs',
		courseCodeN: 2,
		canvasAssignment: 'assignment',
		assignmentTitle: 'ig-title',
		availableDate: 'assignment-date-available',
		availableStatus: 'status-description',
		dueDate: 'assignment-date-due',
		dateElement: 'screenreader-only',
		notAvailableStatus: 'Not available until',
		notionKey: null,
		databaseId: null,
		timezone: 'Pacific/Auckland',
		toDoName: 'Name',
		toDoCategory: 'Category',
		toDoCourse: 'Course',
		toDoURL: 'URL',
		toDoStatus: 'Status',
		toDoAvailable: 'Reminder',
		toDoDue: 'Due',
		toDoSpan: 'Date Span',
		categoryCanvas: 'Canvas',
		statusToDo: 'To Do',
		courseCodeOverrides: '{}',
		courseEmojis: '{}',
	});
} */

async function restoreOptions() {
	const fieldsWithDefault = Object.fromEntries(
		Object.entries(CONFIGURATION.FIELDS).map(([field, { defaultValue }]) => [field, defaultValue]),
	);

	const savedFields = <SavedFields>await chrome.storage.local.get(fieldsWithDefault);

	function setElementValueById(id: string, value: string) {
		const element = document.getElementById(id);
		if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) element.value = value;
	}

	Object.entries(savedFields).forEach(([field, value]) => {
		const fieldElementId = CONFIGURATION.FIELDS[<keyof typeof savedFields>field].elementId;
		setElementValueById(fieldElementId, value);
	});
}

function verifyRequiredField(this: HTMLInputElement) {
	// TODO: make this more elegant
	if (saveButton) {
		if (Object.values(requiredFields).some(input => !input.value)) {
			saveButton.innerHTML = 'Missing required fields!';
			saveButton.classList.add('red');
			saveButton.classList.remove('green');
		}
		else {
			saveButton.innerHTML = 'Save';
			saveButton.classList.add('green');
			saveButton.classList.remove('red');
		}
	}

	if (!this.value) {
		this.classList.add('missing-required');
	}
	else {
		this.classList.remove('missing-required');
	}
}

function saveSuccess() {
	if (saveButton) {
		saveButton.innerHTML = 'Saved!';

		setTimeout(() => {
			saveButton.innerHTML = 'Save';
		}, 1325);
	}
}

async function saveOptions() {
	// check if any required fields are missing
	// TODO: make this more elegant
	if (saveButton) {
		if (Object.values(requiredFields).some(input => !input.value)) {
			saveButton.innerHTML = 'Missing required fields!';
			saveButton.classList.add('red');
			saveButton.classList.remove('green');
			return;
		}
		else {
			saveButton.innerHTML = 'Save';
			saveButton.classList.add('green');
			saveButton.classList.remove('red');
		}
	}

	saveSuccess();

	function getElementValueById(id: string): NullIfEmpty<string> | void {
		const element = document.getElementById(id);
		if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return element.value || null;
	}

	const fieldElementValues = Object.fromEntries(
		Object.entries(CONFIGURATION.FIELDS).map(([field, { elementId }]) => [field, getElementValueById(elementId)]),
	);

	await chrome.storage.local.set(fieldElementValues);
}

document.addEventListener('DOMContentLoaded', restoreOptions);

const requiredFields = (<NodeListOf<HTMLInputElement>>document.querySelectorAll('input[required]'));

requiredFields.forEach(element => element.addEventListener('input', verifyRequiredField));

const saveButton = document.getElementById('save-button');

if (saveButton) {
	saveButton.addEventListener('click', saveOptions);
}

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		saveOptions();
	}
});