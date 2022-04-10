import { EmojiRequest, TimeZoneRequest } from '../api-handlers/notion';

type NestedKeyOf<I> = {
	[K in keyof I]: I[K] extends object ? NestedKeyOf<I[K]> | OptionsConfiguration<I[K]> | null : OptionsConfiguration<I[K]>;
};

type OptionsConfiguration<T> = [elementId: string, defaultValue: T | null];

const OPTIONS_CONFIGURATION: NestedKeyOf<Options> = {
	timeZone: ['timezone', 'Pacific/Auckland'],
	canvas: {
		timeZone: ['timezone', 'Pacific/Auckland'],
		classNames: {
			breadcrumbs: ['breadcrumbs', 'ic-app-crumbs'],
			assignment: ['assignment-class', 'assignment'],
			title: ['assignment-title', 'ig-title'],
			availableDate: ['available-date', 'assignment-date-available'],
			availableStatus: ['available-status', 'status-description'],
			dueDate: ['due-date', 'assignment-date-due'],
			dateElement: ['date-element', 'screenreader-only'],
		},
		classValues: {
			courseCodeN: ['course-code-n', 2],
			notAvailable: ['status-not-available', 'Not available until'],
		},
		selectors: null,
		courseCodeOverrides: ['course-code-overrides', {}],
	},
	notion: {
		notionKey: ['notion-key', null],
		databaseId: ['database-id', null],
		timeZone: ['timezone', 'Pacific/Auckland'],
		propertyNames: {
			name: ['notion-property-name', 'Name'],
			category: ['notion-property-category', 'Category'],
			course: ['notion-property-course', 'Course'],
			url: ['notion-property-url', 'URL'],
			status: ['notion-property-status', 'Status'],
			available: ['notion-property-available', 'Reminder'],
			due: ['notion-property-due', 'Due'],
			span: ['notion-property-span', 'Date Span'],
		},
		propertyValues: {
			categoryCanvas: ['notion-category-canvas', 'Canvas'],
			statusToDo: ['notion-status-todo', 'To Do'],
		},
		courseEmojis: ['course-emojis', {}],
	},
};

interface Options {
	timeZone: TimeZoneRequest | null;
	canvas: {
		timeZone: Options['timeZone'];
		classNames: {
			breadcrumbs: string;
			assignment: string;
			title: string;
			availableDate: string;
			availableStatus: string;
			dueDate: string;
			dateElement: string;
		};
		classValues: {
			courseCodeN: number,
			notAvailable: string;
		};
		selectors: {
			courseCode: string;
			availableStatus: string;
			availableDate: string;
			dueDate: string;
		};
		courseCodeOverrides: Record<string, string>;
	};
	notion: {
		notionKey: string;
		databaseId: string;
		timeZone: Options['timeZone'];
		propertyNames: {
			name: string | null;
			category: string | null;
			course: string | null;
			url: string | null;
			status: string | null;
			available: string | null;
			due: string | null;
			span: string | null;
		};
		propertyValues: {
			categoryCanvas: string | null;
			statusToDo: string | null;
		};
		courseEmojis: Record<string, EmojiRequest>;
	};
}

// TODO

/* export async function getOptionsFromStorage(): Options {
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


function queryId(id: string): string | void {
	const element = document.getElementById(id);

	if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return element.value;
}

function setValueById(id: string, value: string): void {
	const element = document.getElementById(id);

	if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) element.value = value;
}

async function restoreOptions() {
	const options = await chrome.storage.local.get({
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

	Object.entries(options).forEach(([id, value]) => setValueById(id, value));
}

function verifyRequiredField(this: HTMLInputElement) {
	if (!this.value) this.classList.add('missing-required');
	else this.classList.remove('missing-required');
}

function saveSuccess() {
	if (saveButton) {
		saveButton.innerHTML = 'Saved!';

		setTimeout(() => {
			saveButton.innerHTML = 'Save';
		}, 1325);
	}
}

function saveError() {
	if (saveButton) {
		saveButton.innerHTML = 'Missing required fields!';
		saveButton.classList.add('red');
		saveButton.classList.remove('green');

		setTimeout(() => {
			saveButton.innerHTML = 'Save';
			saveButton.classList.add('green');
			saveButton.classList.remove('red');
		}, 3000);
	}
}

async function saveOptions() {
	// check if any required fields are missing
	if (Object.values(requiredFields).some(input => !input.value)) {
		return saveError();
	}

	saveSuccess();

	await chrome.storage.local.set({
		breadcrumbs: queryId('breadcrumbs'),
		courseCodeN: queryId('courseCodeN'),
		canvasAssignment: queryId('canvasAssignment'),
		assignmentTitle: queryId('assignmentTitle'),
		availableDate: queryId('availableDate'),
		availableStatus: queryId('availableStatus'),
		dueDate: queryId('dueDate'),
		dateElement: queryId('dateElement'),
		notAvailableStatus: queryId('notAvailableStatus'),
		notionKey: queryId('notionKey'),
		databaseId: queryId('databaseId'),
		timezone: queryId('timezone'),
		toDoName: queryId('toDoName'),
		toDoCategory: queryId('toDoCategory'),
		toDoCourse: queryId('toDoCourse'),
		toDoURL: queryId('toDoURL'),
		toDoStatus: queryId('toDoStatus'),
		toDoAvailable: queryId('toDoAvailable'),
		toDoDue: queryId('toDoDue'),
		toDoSpan: queryId('toDoSpan'),
		categoryCanvas: queryId('categoryCanvas'),
		statusToDo: queryId('statusToDo'),
		courseCodeOverrides: queryId('courseCodeOverrides'),
		courseEmojis: queryId('courseEmojis'),
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);

const requiredFields = (<NodeListOf<HTMLInputElement>>document.querySelectorAll('input[required]'));

requiredFields.forEach(element => element.addEventListener('input', verifyRequiredField));

const saveButton = document.getElementById('saveButton');
if (saveButton) {
	saveButton.addEventListener('click', saveOptions);
}

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		saveOptions();
	}
});