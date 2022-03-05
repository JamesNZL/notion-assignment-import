function queryId(id: string): string | void {
	const element = document.getElementById(id);

	if (element && element instanceof HTMLInputElement) return element.value;
}

function setValueById(id: string, value: string): void {
	const element = document.getElementById(id);

	if (element && element instanceof HTMLInputElement) element.value = value;
}

async function saveOptions() {
	await chrome.storage.local.set({
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
	});

	// Update status to let user know options were saved.
	const status = document.getElementById('status');

	if (status) {
		status.textContent = 'Options saved.';
		setTimeout(() => {
			status.textContent = '';
		}, 750);
	}
}

async function restoreOptions() {
	const options = await chrome.storage.local.get({
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
	});

	Object.entries(options).forEach(([key, value]) => setValueById(key, value));
}

document.addEventListener('DOMContentLoaded', restoreOptions);

const saveButton = document.getElementById('saveButton');
if (saveButton) saveButton.addEventListener('click', saveOptions);