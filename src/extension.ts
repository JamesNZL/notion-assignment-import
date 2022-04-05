import { SavedAssignments } from './parseAssignments';
import { notionImport } from './notionImport';

type valueof<T> = T[keyof T];

const buttons = {
	optionsButton: document.getElementById('optionsButton'),
	clearStorageButton: document.getElementById('clearStorageButton'),
	viewSavedButton: document.getElementById('viewSavedButton'),
	copySavedButton: document.getElementById('copySavedButton'),
	viewCoursesButton: document.getElementById('viewCoursesButton'),
	parseButton: document.getElementById('parseButton'),
	notionImportButton: document.getElementById('notionImportButton'),
};

if (Object.values(buttons).every(button => button !== null)) {
	const {
		optionsButton,
		clearStorageButton,
		viewSavedButton,
		copySavedButton,
		viewCoursesButton,
		parseButton,
		notionImportButton,
	} = <{
		[key: string]: NonNullable<valueof<typeof buttons>>;
	}>buttons;

	optionsButton.addEventListener('click', () => {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		}

		else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	});

	clearStorageButton.addEventListener('click', () => {
		chrome.storage.local.remove('savedAssignments');

		updateSavedCoursesList();
	});

	viewSavedButton.addEventListener('click', async () => {
		const savedCourses = document.getElementById('savedCoursesList');

		if (savedCourses) {
			const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

			savedCourses.innerHTML = `<p><code>${JSON.stringify(savedAssignments)}</code></p>`;
		}
	});

	copySavedButton.addEventListener('click', async () => {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		await navigator.clipboard.writeText(JSON.stringify(savedAssignments));

		copySavedButton.innerHTML = 'Copied to clipboard!';
	});

	viewCoursesButton.addEventListener('click', () => updateSavedCoursesList());

	parseButton.addEventListener('click', async () => {
		await chrome.storage.local.remove('savedCourse');

		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		if (!tab.id) return;

		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: ['dist/parseAssignments.js'],
		});

		let courseCode = undefined;
		while (courseCode === undefined) {
			({ savedCourse: courseCode } = await chrome.storage.local.get('savedCourse'));
		}

		updateSavedCoursesList();
		if (courseCode) parseButton.innerHTML = `Saved ${courseCode}!`;
	});

	notionImportButton.addEventListener('click', async () => {
		notionImportButton.innerHTML = 'Exporting to Notion...';

		const createdAssignments = await notionImport();

		if (createdAssignments) {
			const createdNames = (createdAssignments.length)
				? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
				: '';

			notionImportButton.innerHTML = `Imported ${createdAssignments.length} assignments!`;
			alert(`Created ${createdAssignments.length} new assignments.${createdNames}`);
		}
	});
}

async function updateSavedCoursesList() {
	const savedCourses = document.getElementById('savedCoursesList');

	if (savedCourses) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		const coursesList = Object.entries(savedAssignments).reduce((list: string, [course, assignments]) => list + `<li>${course} (${assignments.length} assignments)</li>\n`, '');

		savedCourses.innerHTML = (coursesList)
			? `<ol>${coursesList}</ol>`
			: '<p>No saved courses.</p>';
	}
}

updateSavedCoursesList();