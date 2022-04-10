import { EmojiRequest, TimeZoneRequest } from '../api-handlers/notion';
import CONFIGURATION from './configuration';

type Optional<T> = T | '';
type NullIfEmpty<T> = T | null;

interface RequiredFields {
	canvas: {
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
			// TODO: validate before save
			courseCodeN: number,
			notAvailable: string;
		};
		selectors: {
			courseCode: string;
			availableStatus: string;
			availableDate: string;
			dueDate: string;
		};
	};
	notion: {
		// initialised to null, but can never be cleared once set
		notionKey: NullIfEmpty<string>;
		databaseId: NullIfEmpty<string>;
	};
}

interface OptionalFields {
	// TODO: validate before save
	timeZone: Optional<NonNullable<TimeZoneRequest>>;
	canvas: {
		timeZone: OptionalFields['timeZone'];
		courseCodeOverrides: Optional<string>;
	};
	notion: {
		timeZone: OptionalFields['timeZone'];
		propertyNames: {
			name: Optional<string>;
			category: Optional<string>;
			course: Optional<string>;
			url: Optional<string>;
			status: Optional<string>;
			available: Optional<string>;
			due: Optional<string>;
			span: Optional<string>;
		};
		propertyValues: {
			categoryCanvas: Optional<string>;
			statusToDo: Optional<string>;
		};
		courseEmojis: Optional<string>;
	};
}

export type SavedOptions = RequiredFields & OptionalFields;

export type Options = SavedOptions & {
	timeZone: NullIfEmpty<string>;
	canvas: {
		timeZone: Options['timeZone'];
		courseCodeOverrides: Record<string, string>;
	};
	notion: {
		timeZone: Options['timeZone'];
		propertyNames: {
			name: NullIfEmpty<string>;
			category: NullIfEmpty<string>;
			course: NullIfEmpty<string>;
			url: NullIfEmpty<string>;
			status: NullIfEmpty<string>;
			available: NullIfEmpty<string>;
			due: NullIfEmpty<string>;
			span: NullIfEmpty<string>;
		};
		propertyValues: {
			categoryCanvas: NullIfEmpty<string>;
			statusToDo: NullIfEmpty<string>;
		};
		// TODO: validate before save
		courseEmojis: Record<string, EmojiRequest>;
	};
};

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

	// TODO: fix this 💩 temp fix 😃

	const _temp = {
		'breadcrumbs': options.breadcrumbs,
		'course-code-n': options.courseCodeN,
		'assignment-class': options.canvasAssignment,
		'assignment-title': options.assignmentTitle,
		'available-date': options.availableDate,
		'available-status': options.availableStatus,
		'due-date': options.dueDate,
		'date-element': options.dateElement,
		'status-not-available': options.notAvailableStatus,
		'notion-key': options.notionKey,
		'database-id': options.databaseId,
		'timezone': options.timezone,
		'notion-property-name': options.toDoName,
		'notion-property-category': options.toDoCategory,
		'notion-property-course': options.toDoCourse,
		'notion-property-url': options.toDoURL,
		'notion-property-status': options.toDoStatus,
		'notion-property-available': options.toDoAvailable,
		'notion-property-due': options.toDoDue,
		'notion-property-span': options.toDoSpan,
		'notion-category-canvas': options.categoryCanvas,
		'notion-status-todo': options.statusToDo,
		'course-code-overrides': options.courseCodeOverrides,
		'course-emojis': options.courseEmojis,
	};
	Object.entries(_temp).forEach(([id, value]) => setValueById(id, value));
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
	if (Object.values(requiredFields).some(input => !input.value)) {
		return;
	}

	saveSuccess();

	await chrome.storage.local.set({
		breadcrumbs: queryId('breadcrumbs'),
		courseCodeN: queryId('course-code-n'),
		canvasAssignment: queryId('assignment-class'),
		assignmentTitle: queryId('assignment-title'),
		availableDate: queryId('available-date'),
		availableStatus: queryId('available-status'),
		dueDate: queryId('due-date'),
		dateElement: queryId('date-element'),
		notAvailableStatus: queryId('status-not-available'),
		notionKey: queryId('notion-key'),
		databaseId: queryId('database-id'),
		timezone: queryId('timezone'),
		toDoName: queryId('notion-property-name'),
		toDoCategory: queryId('notion-property-category'),
		toDoCourse: queryId('notion-property-course'),
		toDoURL: queryId('notion-property-url'),
		toDoStatus: queryId('notion-property-status'),
		toDoAvailable: queryId('notion-property-available'),
		toDoDue: queryId('notion-property-due'),
		toDoSpan: queryId('notion-property-span'),
		categoryCanvas: queryId('notion-category-canvas'),
		statusToDo: queryId('notion-status-todo'),
		courseCodeOverrides: queryId('course-code-overrides'),
		courseEmojis: queryId('course-emojis'),
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