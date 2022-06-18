import browser from 'webextension-polyfill';

import { SavedAssignments } from './parse';
import { exportToNotion } from './import';

import { getOptions } from '../options/options';

import { valueof } from '../types/utils';

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

class Button {
	private button: HTMLElement;
	private defaultHtml: string;
	private defaultClassList: string;
	private timeouts: Record<string, NodeJS.Timeout> = {};

	public constructor(id: ElementId) {
		const element = getElementById(id);

		if (!element) throw new Error(`Invalid button identifier ${id}!`);

		this.button = element;
		this.defaultHtml = element.innerHTML;
		this.defaultClassList = element.classList.value;
	}

	public getHTML() {
		return this.button.innerHTML;
	}

	public setHTML(html: string) {
		this.button.innerHTML = html;
	}

	public resetHTML(delay: number) {
		this.setTimeout('resetHTML', () => {
			this.setHTML(this.defaultHtml);
			this.button.classList.value = this.defaultClassList;
		}, delay);
	}

	public addClass(className: string) {
		this.button.classList.add(className);
	}

	public removeClass(className: string) {
		this.button.classList.remove(className);
	}

	public hide() {
		this.button.style.display = 'none';
	}

	public unhide() {
		this.button.style.display = '';
	}

	public addEventListener(...args: Parameters<typeof HTMLElement.prototype.addEventListener>) {
		this.button.addEventListener(...args);
	}

	public setTimeout(name: string, timeout: () => void, delay: number) {
		clearTimeout(this.timeouts[name]);
		this.timeouts[name] = setTimeout(timeout, delay);
	}

	public clearTimeout(name: string) {
		clearTimeout(this.timeouts[name]);
	}
}

const SavedCoursesList = {
	element: document.getElementById('saved-courses-list'),
	renderChanges: true,

	disableUpdates() {
		this.renderChanges = false;
	},

	enableUpdates() {
		this.renderChanges = true;
	},

	async listCourses(savedAssignments?: SavedAssignments) {
		if (this.element) {
			savedAssignments = savedAssignments ?? <SavedAssignments>(await browser.storage.local.get({ savedAssignments: {} })).savedAssignments;

			const coursesList = Object.entries(savedAssignments).reduce((list: string, [course, assignments]) => list + `<li><strong>${course}</strong> (<code>${assignments.length}</code> assignment${(assignments.length !== 1) ? 's' : ''})</li>\n`, '');

			buttons.listCourses.hide();
			buttons.listAssignments.unhide();

			this.element.innerHTML = (coursesList && this.renderChanges)
				? `<ol>${coursesList}</ol>`
				: '<p>No saved courses.</p>';
		}
	},

	async listAssignments() {
		if (this.element) {
			const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await browser.storage.local.get({ savedAssignments: {} });

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
			buttons.listCourses.unhide();

			this.element.innerHTML = (assignmentsList && this.renderChanges)
				? `<ol>${assignmentsList}</ol>`
				: '<p>No saved assignments.</p>';
		}
	},
};

const buttons: Record<ButtonName, Button> = {
	options: new Button('options-button'),
	parse: new Button('parse-button'),
	export: new Button('export-button'),
	listAssignments: new Button('list-assignments-button'),
	listCourses: new Button('list-courses-button'),
	copyJSON: new Button('copy-json-button'),
	clearStorage: new Button('clear-storage-button'),
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

	SavedCoursesList.listCourses();

	if (courseCode) {
		buttons.parse.setHTML(`Saved ${courseCode}!`);
		buttons.parse.resetHTML(1325);
	}
});

buttons.export.addEventListener('click', async () => {
	buttons.export.setHTML('Exporting to Notion...');

	const createdAssignments = await exportToNotion();

	if (createdAssignments) {
		const createdNames = (createdAssignments.length)
			? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
			: '';

		buttons.export.setHTML(`Imported <code>${createdAssignments.length}</code> assignment${(createdAssignments.length !== 1) ? 's' : ''}!`);
		buttons.export.resetHTML(3500);
		alert(`Created ${createdAssignments.length} new assignments.${createdNames}`);
	}
});

buttons.listAssignments.addEventListener('click', () => SavedCoursesList.listAssignments());

buttons.listCourses.addEventListener('click', () => SavedCoursesList.listCourses());

getOptions().then(({ popup: { displayJSONButton } }) => {
	if (!displayJSONButton) buttons.copyJSON.hide();
});

buttons.copyJSON.addEventListener('click', async () => {
	const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await browser.storage.local.get({ savedAssignments: {} });

	await navigator.clipboard.writeText(JSON.stringify(savedAssignments));

	buttons.copyJSON.setHTML('Copied to clipboard!');
	buttons.copyJSON.resetHTML(1325);
});

buttons.clearStorage.addEventListener('click', () => {
	const verifyPrompt = 'I\'m sure!';
	const verifyPeriod = 3000;

	if (buttons.clearStorage.getHTML() !== verifyPrompt) {
		buttons.clearStorage.addClass('red');
		buttons.clearStorage.removeClass('red-hover');

		buttons.clearStorage.setHTML(verifyPrompt);

		SavedCoursesList.listCourses({});
		SavedCoursesList.disableUpdates();

		buttons.clearStorage.setTimeout('restore', () => {
			// reset list display after verify period is over
			SavedCoursesList.enableUpdates();
			SavedCoursesList.listCourses();
		}, verifyPeriod);

		return buttons.clearStorage.resetHTML(verifyPeriod);
	}

	browser.storage.local.remove('savedAssignments');

	SavedCoursesList.listCourses();

	buttons.clearStorage.setHTML('Cleared saved assignments!');
	buttons.clearStorage.resetHTML(3500);
});

SavedCoursesList.listCourses();