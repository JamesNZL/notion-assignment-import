import browser from 'webextension-polyfill';

import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';
import { OAuth2 } from '../apis/oauth';

import { SavedAssignments } from './fetch';
import { exportToNotion } from './import';

import { Element, Button } from '../elements';
import { valueof } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface PopupElements {
	buttons: {
		options: 'options-icon';
		fetch: 'fetch-button';
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
	element: Element.getInstance<PopupElementId>({
		id: 'saved-courses-list',
		type: 'saved courses list',
	}),
	renderChanges: true,

	disableUpdates() {
		this.renderChanges = false;
	},

	enableUpdates() {
		this.renderChanges = true;
	},

	async listCourses(savedAssignments?: SavedAssignments) {
		if (!this.element) return;

		savedAssignments ??= await Storage.getSavedAssignments();

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
	options: Button.getInstance<PopupButtonId>({ id: 'options-icon' }),
	fetch: Button.getInstance<PopupButtonId>({ id: 'fetch-button' }),
	oauth: Button.getInstance<PopupButtonId>({ id: 'notion-oauth-button' }),
	configureDatabase: Button.getInstance<PopupButtonId>({ id: 'configure-database-button' }),
	export: Button.getInstance<PopupButtonId>({ id: 'export-button' }),
	listAssignments: Button.getInstance<PopupButtonId>({ id: 'list-assignments-button' }),
	listCourses: Button.getInstance<PopupButtonId>({ id: 'list-courses-button' }),
	copyJSON: Button.getInstance<PopupButtonId>({ id: 'copy-json-button' }),
	clearStorage: Button.getInstance<PopupButtonId>({ id: 'clear-storage-button' }),
};

buttons.options.addEventListener('click', () => browser.runtime.openOptionsPage());

buttons.fetch.addEventListener('click', async () => {
	buttons.fetch.setButtonLabel('Copying from Canvas...');

	await Storage.clearSavedCourse();

	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

	if (!tab.id) return alert('No active tab found.');

	const result: unknown = await (
		(browser.scripting)
			? browser.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['popup/fetch.js'],
			})
			: browser.tabs.executeScript(tab.id, {
				file: '/popup/fetch.js',
			})
	)
		.catch(console.error);

	if (!result) return alert('An error was encountered whilst attempting to fetch assignments.');

	let courseCode: string | null | undefined = undefined;
	while (courseCode === undefined) {
		courseCode = await Storage.getSavedCourse();
	}

	SavedCoursesList.listCourses();

	if (!courseCode) return;

	buttons.fetch.setButtonLabel(`Saved ${courseCode}!`);
	buttons.fetch.resetHTML(1325);
});

if (!OAuth2.isIdentitySupported) {
	buttons.oauth.setDefaultLabel('Configure Integration');
	buttons.oauth.resetHTML();
}

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

(OAuth2.isIdentitySupported)
	? buttons.oauth.addEventListener('click', async () => {
		buttons.oauth.setButtonLabel('Authorising with Notion...');

		const success = await OAuth2.authorise();

		if (!success) return buttons.oauth.resetHTML();

		buttons.oauth.setButtonLabel('Authorised!');

		buttons.oauth.setTimeout('authorised', () => {
			buttons.oauth.resetHTML();

			buttons.oauth.hide();
			buttons.configureDatabase.show();

			Storage.clearDatabaseId();
		}, 1325);
	})
	: buttons.oauth.addEventListener('click', buttons.options.click.bind(buttons.options));

buttons.configureDatabase.addEventListener('click', buttons.options.click.bind(buttons.options));

buttons.export.addEventListener('click', async () => {
	buttons.export.setButtonLabel('Exporting to Notion...');

	const exported = await exportToNotion();
	if (!exported) return buttons.export.resetHTML();

	const { created: createdAssignments, updated: updatedAssignments } = exported;

	const createdNames = (createdAssignments.length)
		? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
		: '';
	const updatedNames = (updatedAssignments.length)
		? updatedAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
		: '';

	console.log(`${createdAssignments.length} new assignments created, ${updatedAssignments.length} updated.${createdNames}${updatedNames}`);
	alert(`${createdAssignments.length} new assignments created, ${updatedAssignments.length} updated.${createdNames}${updatedNames}`);
	buttons.export.setButtonLabel(`<code>${createdAssignments.length}</code> new created, <code>${updatedAssignments.length}</code> updated!`);
	buttons.export.resetHTML(3500);
});

buttons.listAssignments.addEventListener('click', SavedCoursesList.listAssignments.bind(SavedCoursesList));

buttons.listCourses.addEventListener('click', SavedCoursesList.listCourses.bind(SavedCoursesList, undefined));

Storage.getOptions().then(({ extension: { displayTheme }, popup: { displayJSONButton } }) => {
	if (displayTheme && displayTheme !== 'system') {
		document.documentElement.classList.add(`${displayTheme}-mode`);
	}

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
	buttons.clearStorage.removeClass('red');
	buttons.clearStorage.removeClass('hover');

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
// @ts-expect-error Key has been removed.
Storage.getStorageKey('notion.propertyNames.status', false).then(value => {
	if (value === false) return;

	const deleteProperty = confirm('Prior support for a \'Status\' Notion property has been removed.\n\nPlease update your database to use the newly-released Notion built-in Status property.\n\nFor more information, visit the GitHub Repository.\n\nClick \'OK\' to hide this message forever.');

	if (!deleteProperty) return;

	// @ts-expect-error Key has been removed.
	Storage.clearStorageKey('notion.propertyNames.status');
});

// * what's new alert
Storage.getLastVersion().then(version => {
	const { version: manifestVersion } = browser.runtime.getManifest();

	if (version === manifestVersion) return;

	// TODO: Clear authorisation on update

	alert(`Your extension has been updated to v${manifestVersion}!\n\nTo see what's new, visit the store page, the Discord Server, or the GitHub Repository.`);

	Storage.setLastVersion(manifestVersion);
});