import browser from 'webextension-polyfill';

import { Storage } from '../apis/storage';

import { SavedAssignments } from './parse';
import { exportToNotion } from './import';

import { Button, getElementById } from '../elements';
import { valueof } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface PopupElements {
	buttons: {
		options: 'options-icon';
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

type PopupButtonName = keyof PopupElements['buttons'];
type PopupButtonId = valueof<PopupElements['buttons']>;
type PopupElementId = PopupButtonId | valueof<PopupElements['elements']>;

const SavedCoursesList = {
	element: getElementById<PopupElementId>('saved-courses-list'),
	renderChanges: true,

	disableUpdates() {
		this.renderChanges = false;
	},

	enableUpdates() {
		this.renderChanges = true;
	},

	async listCourses(savedAssignments?: SavedAssignments) {
		if (this.element) {
			savedAssignments = savedAssignments ?? await Storage.getSavedAssignments();

			const coursesList = Object.entries(savedAssignments).reduce((list: string, [course, assignments]) => list + `<li><strong>${course}</strong> (<code>${assignments.length}</code> assignment${(assignments.length !== 1) ? 's' : ''})</li>\n`, '');

			buttons.listCourses.hide();
			buttons.listAssignments.show();

			this.element.innerHTML = (coursesList && this.renderChanges)
				? `<ol>${coursesList}</ol>`
				: '<p>No saved courses.</p>';
		}
	},

	async listAssignments() {
		if (this.element) {
			const savedAssignments = await Storage.getSavedAssignments();

			const assignmentsList = Object.entries(savedAssignments)
				.reduce((list: string, [course, assignments]) => list +
					`
				<li><strong>${course}</strong></li>\n
				<ul>
					${assignments.reduce((courseList: string, { icon, name, url }) => courseList +
						`<li>${(icon) ? `${icon} ` : ''}<a href='${url}' target='_blank'>${name}</a></li>\n`, '')}
				</ul>\n
				`, '');

			buttons.listAssignments.hide();
			buttons.listCourses.show();

			this.element.innerHTML = (assignmentsList && this.renderChanges)
				? `<ol>${assignmentsList}</ol>`
				: '<p>No saved assignments.</p>';
		}
	},
};

const buttons: Record<PopupButtonName, Button> = {
	options: Button.getInstance<PopupElementId>('options-icon'),
	parse: Button.getInstance<PopupElementId>('parse-button'),
	export: Button.getInstance<PopupElementId>('export-button'),
	listAssignments: Button.getInstance<PopupElementId>('list-assignments-button'),
	listCourses: Button.getInstance<PopupElementId>('list-courses-button'),
	copyJSON: Button.getInstance<PopupElementId>('copy-json-button'),
	clearStorage: Button.getInstance<PopupElementId>('clear-storage-button'),
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
	await Storage.clearSavedCourse();

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

	let courseCode: string | null | undefined = undefined;
	while (courseCode === undefined) {
		courseCode = await Storage.getSavedCourse();
	}

	SavedCoursesList.listCourses();

	if (courseCode) {
		buttons.parse.setLabel(`Saved ${courseCode}!`);
		buttons.parse.resetHTML(1325);
	}
});

buttons.export.addEventListener('click', async () => {
	buttons.export.setLabel('Exporting to Notion...');

	const createdAssignments = await exportToNotion();

	if (createdAssignments) {
		const createdNames = (createdAssignments.length)
			? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
			: '';

		buttons.export.setLabel(`Created <code>${createdAssignments.length}</code> new assignment${(createdAssignments.length !== 1) ? 's' : ''}!`);
		buttons.export.resetHTML(3500);
		alert(`Created ${createdAssignments.length} new assignments.${createdNames}`);
	}
});

buttons.listAssignments.addEventListener('click', SavedCoursesList.listAssignments.bind(SavedCoursesList));

buttons.listCourses.addEventListener('click', () => SavedCoursesList.listCourses());

Storage.getOptions().then(({ popup: { displayJSONButton } }) => {
	if (displayJSONButton) buttons.copyJSON.show();
});

buttons.copyJSON.addEventListener('click', async () => {
	const savedAssignments = await Storage.getSavedAssignments();

	await navigator.clipboard.writeText(JSON.stringify(savedAssignments));

	buttons.copyJSON.setLabel('Copied!');
	buttons.copyJSON.resetHTML(1325);
});

buttons.clearStorage.addEventListener('click', () => {
	const undoPrompt = 'Undo';
	const undoPeriod = 3000;

	if (buttons.clearStorage.getLabel() !== undoPrompt) {
		buttons.clearStorage.addClass('green');
		buttons.clearStorage.removeClass('red-hover');

		buttons.clearStorage.setLabel(undoPrompt);

		SavedCoursesList.listCourses({});
		SavedCoursesList.disableUpdates();

		buttons.clearStorage.setTimeout('clear', () => {
			Storage.clearSavedAssignments();

			SavedCoursesList.listCourses();

			buttons.clearStorage.addClass('red');
			buttons.clearStorage.removeClass('green');
			buttons.clearStorage.setLabel('Cleared!');
			buttons.clearStorage.resetHTML(1325);
		}, undoPeriod);

		return buttons.clearStorage.resetHTML(undoPeriod);
	}

	buttons.clearStorage.clearTimeout('clear');

	// reset list display after verify period is over
	SavedCoursesList.enableUpdates();
	SavedCoursesList.listCourses();

	buttons.clearStorage.resetHTML();
});

SavedCoursesList.listCourses();