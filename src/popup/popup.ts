import browser from 'webextension-polyfill';

import { SavedAssignments } from './parse';
import { exportToNotion } from './import';

import { valueof, areHTMLElements } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface Elements {
	buttons: {
		options: 'options-button';
		parse: 'parse-button';
		export: 'export-button';
		listAssignments: 'list-assignments-button';
		listCourses: 'list-courses-button';
		copyJSON: 'copy-json-button';
		clearStorage: 'clear-storage-button';
	};
	elements: {
		savedCourses: 'saved-courses-list';
	};
}

type ButtonName = keyof Elements['buttons'];
type ButtonId = valueof<Elements['buttons']>;
type ElementId = ButtonId | valueof<Elements['elements']>;

function getElementById(id: ElementId): HTMLElement | null {
	return document.getElementById(id);
}

const buttons: Record<ButtonName, ReturnType<typeof getElementById>> = {
	options: getElementById('options-button'),
	parse: getElementById('parse-button'),
	export: getElementById('export-button'),
	listAssignments: getElementById('list-assignments-button'),
	listCourses: getElementById('list-courses-button'),
	copyJSON: getElementById('copy-json-button'),
	clearStorage: getElementById('clear-storage-button'),
};

function setButtonDisplay(button: HTMLElement | null, display: 'none' | 'inline-block') {
	if (button instanceof HTMLElement) button.style.display = display;
}

if (areHTMLElements(buttons)) {
	const BUTTON_TEXT = {
		DEFAULT: <Record<ButtonId, string>>Object.fromEntries(
			Object.values(buttons).map(button => [<ButtonId>button.id, button.innerHTML]),
		),
		reset(button: valueof<typeof buttons>, delay: number) {
			setTimeout(() => {
				button.innerHTML = this.DEFAULT[<ButtonId>button.id];
			}, delay);
		},
	};

	buttons.options.addEventListener('click', () => {
		if (browser.runtime.openOptionsPage) {
			browser.runtime.openOptionsPage();
		}

		else {
			window.open(browser.runtime.getURL('options.html'));
		}
	});

	buttons.parse.addEventListener('click', async () => {
		await browser.storage.local.remove('savedCourse');

		const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

		if (!tab.id) return alert('No active tab found.');

		const result: unknown = await (
			(browser.scripting)
				? browser.scripting.executeScript({
					target: { tabId: tab.id },
					files: ['popup/parse.js'],
				})
				: browser.tabs.executeScript(tab.id, {
					file: '/popup/parse.js',
				})
					.catch((error: Error) => {
						// Ignore non-structured-clonable error
						if (error.message.includes('non-structured-clonable')) return true;
						throw error;
					})
		)
			.catch(console.error);

		if (!result) return alert('An error was encountered whilst attempting to parse assignments.');

		let courseCode = undefined;
		while (courseCode === undefined) {
			({ savedCourse: courseCode } = await browser.storage.local.get('savedCourse'));
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

	buttons.listAssignments.addEventListener('click', async () => {
		const savedCourses = getElementById('saved-courses-list');

		if (savedCourses) {
			const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await browser.storage.local.get({ savedAssignments: {} });

			const assignmentsList = Object.entries(savedAssignments)
				.reduce((list: string, [course, assignments]) => {
					return list + `<li>${course}</li>\n
					<ul>
					${assignments.reduce((courseList: string, { icon, name, url }) => {
						return courseList + `<li>${(icon) ? `${icon} ` : ''}<a href='${url}' target='_blank'>${name}</a></li>\n`;
					}, '')}
					</ul>\n`;
				}, '');

			setButtonDisplay(buttons.listAssignments, 'none');
			setButtonDisplay(buttons.listCourses, 'inline-block');

			savedCourses.innerHTML = (assignmentsList)
				? `<ol>${assignmentsList}</ol>`
				: '<p>No saved assignments.</p>';
		}
	});

	buttons.listCourses.addEventListener('click', updateSavedCoursesList);

	buttons.copyJSON.addEventListener('click', async () => {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await browser.storage.local.get({ savedAssignments: {} });

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

		browser.storage.local.remove('savedAssignments');

		updateSavedCoursesList();

		buttons.clearStorage.innerHTML = 'Cleared saved assignments!';
		BUTTON_TEXT.reset(buttons.clearStorage, 3500);
	});
}

async function updateSavedCoursesList() {
	const savedCourses = getElementById('saved-courses-list');

	if (savedCourses) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await browser.storage.local.get({ savedAssignments: {} });

		const coursesList = Object.entries(savedAssignments).reduce((list: string, [course, assignments]) => list + `<li>${course} (<code>${assignments.length}</code> assignments)</li>\n`, '');

		setButtonDisplay(buttons.listCourses, 'none');
		setButtonDisplay(buttons.listAssignments, 'inline-block');

		savedCourses.innerHTML = (coursesList)
			? `<ol>${coursesList}</ol>`
			: '<p>No saved courses.</p>';
	}
}

updateSavedCoursesList();