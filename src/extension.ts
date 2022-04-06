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

const displayButton = {
	handler(button: HTMLElement | null, display: 'none' | 'inline-block') {
		if (button instanceof HTMLElement) button.style.display = display;
	},
	JSON(display: 'none' | 'inline-block') {
		this.handler(buttons.viewSavedButton, display);
	},
	listCourses(display: 'none' | 'inline-block') {
		this.handler(buttons.viewCoursesButton, display);
	},
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

	// TODO: Default button values

	optionsButton.addEventListener('click', () => {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		}

		else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	});

	clearStorageButton.addEventListener('click', () => {
		const verifyPrompt = 'I\'m sure!';

		if (clearStorageButton.innerHTML !== verifyPrompt) {
			clearStorageButton.innerHTML = verifyPrompt;
			return setTimeout(() => {
				clearStorageButton.innerHTML = 'Clear Saved Assignments';
			}, 1325);
		}

		chrome.storage.local.remove('savedAssignments');

		updateSavedCoursesList();

		clearStorageButton.innerHTML = 'Cleared saved assignments!';
		setTimeout(() => {
			clearStorageButton.innerHTML = 'Clear Saved Assignments';
		}, 3500);
	});

	viewSavedButton.addEventListener('click', async () => {
		const savedCourses = document.getElementById('savedCoursesList');

		if (savedCourses) {
			const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

			displayButton.JSON('none');
			displayButton.listCourses('inline-block');

			savedCourses.innerHTML = `<p><code>${JSON.stringify(savedAssignments).replace(/,/g, ',<wbr>')}</code></p>`;
		}
	});

	copySavedButton.addEventListener('click', async () => {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		await navigator.clipboard.writeText(JSON.stringify(savedAssignments));

		copySavedButton.innerHTML = 'Copied to clipboard!';
		setTimeout(() => {
			copySavedButton.innerHTML = 'Copy <code>JSON</code> to Clipboard';
		}, 1325);
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
		if (courseCode) {
			parseButton.innerHTML = `Saved ${courseCode}!`;
			setTimeout(() => {
				parseButton.innerHTML = 'Save Canvas Assignments';
			}, 1325);
		}
	});

	notionImportButton.addEventListener('click', async () => {
		notionImportButton.innerHTML = 'Exporting to Notion...';

		const createdAssignments = await notionImport();

		if (createdAssignments) {
			const createdNames = (createdAssignments.length)
				? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
				: '';

			notionImportButton.innerHTML = `Imported ${createdAssignments.length} assignments!`;
			setTimeout(() => {
				notionImportButton.innerHTML = 'Export Saved Assignments';
			}, 3500);
			alert(`Created ${createdAssignments.length} new assignments.${createdNames}`);
		}
	});
}

async function updateSavedCoursesList() {
	const savedCourses = document.getElementById('savedCoursesList');

	if (savedCourses) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		const coursesList = Object.entries(savedAssignments).reduce((list: string, [course, assignments]) => list + `<li>${course} (<code>${assignments.length}</code> assignments)</li>\n`, '');

		displayButton.listCourses('none');
		displayButton.JSON('inline-block');

		savedCourses.innerHTML = (coursesList)
			? `<ol>${coursesList}</ol>`
			: '<p>No saved courses.</p>';
	}
}

updateSavedCoursesList();