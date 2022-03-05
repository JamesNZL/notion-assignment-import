export interface InputAssignment {
	name: string;
	course: string;
	url: string;
	available?: string;
	due?: string;
}

export interface SavedAssignments {
	[key: string]: InputAssignment[];
}

type valueof<T> = T[keyof T];

interface Constants {
	COURSE: string;
	CLASSES: {
		ASSIGNMENT: string;
		TITLE: string;
		AVAILABLE_DATE: string;
		AVAILABLE_STATUS: string;
		DUE_DATE: string;
		SCREENREADER_ONLY: string;
	};
	SELECTORS: {
		[key: string]: string;
	};
	VALUES: {
		NOT_AVAILABLE_STATUS: string;
	};
}

async function parseAssignments(courseCode: string): Promise<void> {
	const classSelector = (className: string): string => `.${className}`;

	const options = await chrome.storage.local.get({
		canvasAssignment: 'assignment',
		assignmentTitle: 'ig-title',
		availableDate: 'assignment-date-available',
		availableStatus: 'status-description',
		dueDate: 'assignment-date-due',
		dateElement: 'screenreader-only',
		notAvailableStatus: 'Not available until',
	});

	const CONSTANTS: Constants = {
		COURSE: courseCode,
		CLASSES: {
			ASSIGNMENT: options.canvasAssignment,
			TITLE: options.assignmentTitle,
			AVAILABLE_DATE: options.availableDate,
			AVAILABLE_STATUS: options.availableStatus,
			DUE_DATE: options.dueDate,
			SCREENREADER_ONLY: options.dateElement,
		},
		SELECTORS: {
			get AVAILABLE_STATUS() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.AVAILABLE_STATUS)}`; },
			get AVAILABLE_DATE() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
			get DUE_DATE() { return `${classSelector(CONSTANTS.CLASSES.DUE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
		},
		VALUES: {
			NOT_AVAILABLE_STATUS: options.notAvailableStatus,
		},
	};

	function verifySelector(assignment: NonNullable<ReturnType<Element['querySelector']>>, selector: string): NonNullable<ReturnType<Element['querySelector']>> | void {
		const element = assignment.querySelector(selector);

		return (element)
			? element
			: alert(`Incorrect selector: ${selector}`);
	}

	function parseAvailableDate(assignment: NonNullable<ReturnType<Element['querySelector']>>): string {
		const availableStatus = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_STATUS);
		const availableDate = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_DATE);

		// If the AVAILABLE_STATUS class actually contains the 'available until' date, return an empty string
		if (availableStatus?.textContent?.trim() !== CONSTANTS.VALUES.NOT_AVAILABLE_STATUS) return '';

		return availableDate?.textContent?.trim() ?? '';
	}

	function parseAssignment(assignment: NonNullable<ReturnType<Element['querySelector']>>): InputAssignment[] {
		const assignmentTitle = verifySelector(assignment, classSelector(CONSTANTS.CLASSES.TITLE));

		// Ensure the configured selectors are valid
		if (!assignmentTitle?.textContent || !(assignmentTitle instanceof HTMLAnchorElement)) return [];

		return [{
			name: assignmentTitle.textContent.trim(),
			course: CONSTANTS.COURSE,
			url: assignmentTitle.href,
			available: parseAvailableDate(assignment),
			due: assignment.querySelector(CONSTANTS.SELECTORS.DUE_DATE)?.textContent?.trim() ?? '',
		}];
	}

	const assignments = document.getElementsByClassName(CONSTANTS.CLASSES.ASSIGNMENT);

	const parsed = Object.values(assignments).flatMap(assignment => parseAssignment(assignment));

	const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

	savedAssignments[courseCode] = parsed;

	chrome.storage.local.set({ savedAssignments });
}

import notionImport = require('./import');

const buttons = {
	optionsButton: document.getElementById('optionsButton'),
	clearStorageButton: document.getElementById('clearStorageButton'),
	viewSavedButton: document.getElementById('viewSavedButton'),
	viewCoursesButton: document.getElementById('viewCoursesButton'),
	parseButton: document.getElementById('parseButton'),
	notionImportButton: document.getElementById('notionImportButton'),
};

if (Object.values(buttons).every(button => button)) {
	const {
		optionsButton,
		clearStorageButton,
		viewSavedButton,
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

	viewSavedButton.addEventListener('click', () => {
		const savedCourses = document.getElementById('savedCoursesList');

		if (savedCourses) {
			chrome.storage.local.get({ savedAssignments: {} }, ({ savedAssignments }) => {
				savedCourses.innerHTML = `<p><code>${JSON.stringify(savedAssignments)}</code></p>`;
			});
		}
	});

	viewCoursesButton.addEventListener('click', () => {
		updateSavedCoursesList();
	});

	parseButton.addEventListener('click', async () => {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const courseCodeInput = document.getElementById('courseCode');

		if (!tab.id || !courseCodeInput || !(courseCodeInput instanceof HTMLInputElement)) return;

		if (!courseCodeInput.value) return alert('You must enter the course code.');

		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: parseAssignments,
			args: [courseCodeInput.value],
		});

		updateSavedCoursesList();

		parseButton.innerHTML = `Saved ${courseCodeInput.value}!`;
		courseCodeInput.value = '';
	});

	notionImportButton.addEventListener('click', async () => {
		notionImportButton.innerHTML = 'Importing to Notion...';

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