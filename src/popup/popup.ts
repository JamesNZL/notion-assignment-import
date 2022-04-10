import { SavedAssignments } from './parse';
import { exportToNotion } from './import';

import { assertHTMLElements } from '../types/utils';

type ButtonNames = ['options', 'parse', 'export', 'viewJSON', 'listCourses', 'copyJSON', 'clearStorage'];

const buttons: Record<ButtonNames[number], HTMLElement | null> = {
	options: document.getElementById('options-button'),
	parse: document.getElementById('parse-button'),
	export: document.getElementById('export-button'),
	viewJSON: document.getElementById('view-json-button'),
	listCourses: document.getElementById('list-courses-button'),
	copyJSON: document.getElementById('copy-json-button'),
	clearStorage: document.getElementById('clear-storage-button'),
};

function setButtonDisplay(button: HTMLElement | null, display: 'none' | 'inline-block') {
	if (button instanceof HTMLElement) button.style.display = display;
}

if (assertHTMLElements(buttons)) {
	const BUTTON_TEXT = {
		DEFAULT: <Record<ButtonNames[number], string>>Object.fromEntries(
			Object.entries(buttons).map(([buttonName, buttonElement]) => [buttonName, buttonElement.innerHTML]),
		),
		reset(button: HTMLElement, delay: number) {
			setTimeout(() => {
				button.innerHTML = this.DEFAULT[<keyof typeof this.DEFAULT>button.id];
			}, delay);
		},
	};

	buttons.options.addEventListener('click', () => {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		}

		else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	});

	buttons.parse.addEventListener('click', async () => {
		await chrome.storage.local.remove('savedCourse');

		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		if (!tab.id) return;

		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: ['dist/popup/parse.js'],
		});

		let courseCode = undefined;
		while (courseCode === undefined) {
			({ savedCourse: courseCode } = await chrome.storage.local.get('savedCourse'));
		}

		updateSavedCoursesList();
		if (courseCode) {
			buttons.parse.innerHTML = `Saved ${courseCode}!`;
			BUTTON_TEXT.reset(buttons.parse, 1325);
		}
	});

	buttons.export.addEventListener('click', async () => {
		buttons.export.innerHTML = 'Exporting to Notion...';

		const createdAssignments = await exportToNotion();

		if (createdAssignments) {
			const createdNames = (createdAssignments.length)
				? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
				: '';

			buttons.export.innerHTML = `Imported ${createdAssignments.length} assignments!`;
			BUTTON_TEXT.reset(buttons.export, 3500);
			alert(`Created ${createdAssignments.length} new assignments.${createdNames}`);
		}
	});

	buttons.viewJSON.addEventListener('click', async () => {
		const savedCourses = document.getElementById('saved-courses-list');

		if (savedCourses) {
			const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

			setButtonDisplay(buttons.viewJSON, 'none');
			setButtonDisplay(buttons.listCourses, 'inline-block');

			savedCourses.innerHTML = `<p><code>${JSON.stringify(savedAssignments).replace(/,/g, ',<wbr>')}</code></p>`;
		}
	});

	buttons.listCourses.addEventListener('click', () => updateSavedCoursesList());

	buttons.copyJSON.addEventListener('click', async () => {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		await navigator.clipboard.writeText(JSON.stringify(savedAssignments));

		buttons.copyJSON.innerHTML = 'Copied to clipboard!';
		BUTTON_TEXT.reset(buttons.copyJSON, 1325);
	});

	buttons.clearStorage.addEventListener('click', () => {
		const verifyPrompt = 'I\'m sure!';

		if (buttons.clearStorage.innerHTML !== verifyPrompt) {
			buttons.clearStorage.innerHTML = verifyPrompt;

			return BUTTON_TEXT.reset(buttons.clearStorage, 1325);
		}

		chrome.storage.local.remove('savedAssignments');

		updateSavedCoursesList();

		buttons.clearStorage.innerHTML = 'Cleared saved assignments!';
		BUTTON_TEXT.reset(buttons.clearStorage, 3500);
	});
}

async function updateSavedCoursesList() {
	const savedCourses = document.getElementById('saved-courses-list');

	if (savedCourses) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		const coursesList = Object.entries(savedAssignments).reduce((list: string, [course, assignments]) => list + `<li>${course} (<code>${assignments.length}</code> assignments)</li>\n`, '');

		setButtonDisplay(buttons.listCourses, 'none');
		setButtonDisplay(buttons.viewJSON, 'inline-block');

		savedCourses.innerHTML = (coursesList)
			? `<ol>${coursesList}</ol>`
			: '<p>No saved courses.</p>';
	}
}

updateSavedCoursesList();