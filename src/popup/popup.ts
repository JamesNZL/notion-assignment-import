import browser from 'webextension-polyfill';

import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';
import { OAuth2 } from '../apis/oauth';

import { SavedAssignments } from './parse';
import { exportToNotion } from './import';

import { Element, Button } from '../elements';
import { valueof } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface PopupElements {
	buttons: {
		options: 'options-icon';
		parse: 'parse-button';
		oauth: 'notion-oauth-button';
		configureDatabase: 'configure-database-button';
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
	element: Element.getInstance<PopupElementId>('saved-courses-list', 'saved courses list'),
	renderChanges: true,

	disableUpdates() {
		this.renderChanges = false;
	},

	enableUpdates() {
		this.renderChanges = true;
	},

	async listCourses(savedAssignments?: SavedAssignments) {
		if (!this.element) return;

		savedAssignments = savedAssignments ?? await Storage.getSavedAssignments();

		const coursesList = Object.entries(savedAssignments).reduce((list: string, [course, assignments]) => list + `
		<li>
			<strong>${course}</strong> (<code>${assignments.length}</code> assignment${(assignments.length !== 1) ? 's' : ''})
		</li>
		`, '');

		buttons.listCourses.hide();
		buttons.listAssignments.show();

		(coursesList && this.renderChanges)
			? this.element.safelySetInnerHTML(`<ol>${coursesList}</ol>`)
			: this.element.safelySetInnerHTML('<p>No saved courses.</p>');
	},

	async listAssignments() {
		if (!this.element) return;

		const savedAssignments = await Storage.getSavedAssignments();

		const assignmentsList = Object.entries(savedAssignments)
			.reduce((list: string, [course, assignments]) => list + `
			<li>
				<strong>${course}</strong>
			</li>
			<ul>
				${assignments.reduce((courseList: string, { icon, name, url }) => courseList + `
					<li>
						${(icon) ? `${icon} ` : ''}<a href='${url}' target='_blank'>${name}</a>
					</li>
					`, '')}
			</ul>
			`, '');

		buttons.listAssignments.hide();
		buttons.listCourses.show();

		(assignmentsList && this.renderChanges)
			? this.element.safelySetInnerHTML(`<ol>${assignmentsList}</ol>`)
			: this.element.safelySetInnerHTML('<p>No saved assignments.</p>');
	},
};

const buttons: Record<PopupButtonName, Button> = <const>{
	options: Button.getInstance<PopupButtonId>('options-icon'),
	parse: Button.getInstance<PopupButtonId>('parse-button'),
	oauth: Button.getInstance<PopupButtonId>('notion-oauth-button'),
	configureDatabase: Button.getInstance<PopupButtonId>('configure-database-button'),
	export: Button.getInstance<PopupButtonId>('export-button'),
	listAssignments: Button.getInstance<PopupButtonId>('list-assignments-button'),
	listCourses: Button.getInstance<PopupButtonId>('list-courses-button'),
	copyJSON: Button.getInstance<PopupButtonId>('copy-json-button'),
	clearStorage: Button.getInstance<PopupButtonId>('clear-storage-button'),
};

buttons.options.addEventListener('click', () => browser.runtime.openOptionsPage());

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

	if (!courseCode) return;

	buttons.parse.setButtonLabel(`Saved ${courseCode}!`);
	buttons.parse.resetHTML(1325);
});

Storage.getNotionAuthorisation().then(async ({ accessToken }) => {
	const notionClient = NotionClient.getInstance({ auth: accessToken ?? '' });

	const validAccessToken = accessToken && await notionClient.validateToken;

	if (!validAccessToken) {
		buttons.oauth.show();
		buttons.export.hide();

		Storage.clearDatabaseId();

		return;
	}

	const { notion: { databaseId } } = await Storage.getOptions();

	const validDatabaseId = databaseId && await notionClient.retrieveDatabase(databaseId);

	if (validDatabaseId) return;

	buttons.configureDatabase.show();
	buttons.export.hide();
});

buttons.oauth.addEventListener('click', async () => {
	buttons.oauth.setButtonLabel('Authorising with Notion...');

	// TODO: ensure browser.identity
	const success = await OAuth2.authorise();

	if (!success) return buttons.oauth.resetHTML();

	buttons.oauth.setButtonLabel('Authorised!');

	buttons.oauth.setTimeout('authorised', () => {
		buttons.oauth.resetHTML();

		buttons.oauth.hide();
		buttons.configureDatabase.show();

		Storage.clearDatabaseId();
	}, 1325);
});

buttons.configureDatabase.addEventListener('click', buttons.options.click.bind(buttons.options));

buttons.export.addEventListener('click', async () => {
	buttons.export.setButtonLabel('Exporting to Notion...');

	const createdAssignments = await exportToNotion();

	if (!createdAssignments) return;

	const createdNames = (createdAssignments.length)
		? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
		: '';

	alert(`Created ${createdAssignments.length} new assignments.${createdNames}`);
	buttons.export.setButtonLabel(`Created <code>${createdAssignments.length}</code> new assignment${(createdAssignments.length !== 1) ? 's' : ''}!`);
	buttons.export.resetHTML(3500);
});

buttons.listAssignments.addEventListener('click', SavedCoursesList.listAssignments.bind(SavedCoursesList));

buttons.listCourses.addEventListener('click', () => SavedCoursesList.listCourses());

Storage.getOptions().then(({ popup: { displayJSONButton } }) => {
	if (displayJSONButton) buttons.copyJSON.show();
});

buttons.copyJSON.addEventListener('click', async () => {
	const savedAssignments = await Storage.getSavedAssignments();

	await navigator.clipboard.writeText(JSON.stringify(savedAssignments));

	buttons.copyJSON.setButtonLabel('Copied!');
	buttons.copyJSON.resetHTML(1325);
});

buttons.clearStorage.addEventListener('click', () => {
	const undoPrompt = 'Undo';
	const undoPeriod = 3000;

	if (buttons.clearStorage.getButtonLabel() === undoPrompt) {
		buttons.clearStorage.clearTimeout('clear');

		SavedCoursesList.enableUpdates();
		SavedCoursesList.listCourses();

		buttons.clearStorage.resetHTML();

		return;
	}

	buttons.clearStorage.addClass('green');
	buttons.clearStorage.removeClass('red-hover');

	buttons.clearStorage.setButtonLabel(undoPrompt);

	SavedCoursesList.listCourses({});
	SavedCoursesList.disableUpdates();

	buttons.clearStorage.setTimeout('clear', () => {
		Storage.clearSavedAssignments();

		// reset list display after verify period is over
		SavedCoursesList.enableUpdates();
		SavedCoursesList.listCourses();

		buttons.clearStorage.addClass('red');
		buttons.clearStorage.removeClass('green');
		buttons.clearStorage.setButtonLabel('Cleared!');
		buttons.clearStorage.resetHTML(1325);
	}, undoPeriod);

	buttons.clearStorage.resetHTML(undoPeriod);
});

SavedCoursesList.listCourses();

// ! alert for removal of status select property support
Storage.getStorageKey('notion.propertyNames.status', false).then(value => {
	if (value === false) return;

	const deleteProperty = confirm('Prior support for a \'Status\' Notion property has been removed.\n\nPlease update your database to use the newly-released Notion built-in Status property.\n\nFor more information, visit the GitHub Repository.\n\nClick \'OK\' to hide this message forever.');

	if (!deleteProperty) return;

	Storage.clearStorageKey('notion.propertyNames.status');
});