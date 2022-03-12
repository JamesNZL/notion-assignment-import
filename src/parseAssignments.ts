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
	CLASSES: {
		BREADCRUMBS: string;
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
		COURSE_CODE_N: number,
		NOT_AVAILABLE_STATUS: string;
	};
}

async function parseAssignments(): Promise<void | string | 'Unknown Course Code'> {
	const classSelector = (className: string): string => `.${className}`;

	const options = await chrome.storage.local.get({
		breadcrumbs: 'ic-app-crumbs',
		courseCodeN: 2,
		canvasAssignment: 'assignment',
		assignmentTitle: 'ig-title',
		availableDate: 'assignment-date-available',
		availableStatus: 'status-description',
		dueDate: 'assignment-date-due',
		dateElement: 'screenreader-only',
		notAvailableStatus: 'Not available until',
		courseCodeOverrides: '{}',
	});

	const CONSTANTS: Constants = {
		CLASSES: {
			BREADCRUMBS: options.breadcrumbs,
			ASSIGNMENT: options.canvasAssignment,
			TITLE: options.assignmentTitle,
			AVAILABLE_DATE: options.availableDate,
			AVAILABLE_STATUS: options.availableStatus,
			DUE_DATE: options.dueDate,
			SCREENREADER_ONLY: options.dateElement,
		},
		SELECTORS: {
			get COURSE_CODE() { return `${classSelector(CONSTANTS.CLASSES.BREADCRUMBS)} li:nth-of-type(${CONSTANTS.VALUES.COURSE_CODE_N}) span`; },
			get AVAILABLE_STATUS() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.AVAILABLE_STATUS)}`; },
			get AVAILABLE_DATE() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
			get DUE_DATE() { return `${classSelector(CONSTANTS.CLASSES.DUE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
		},
		VALUES: {
			COURSE_CODE_N: options.courseCodeN,
			NOT_AVAILABLE_STATUS: options.notAvailableStatus,
		},
	};

	function parseJSON(jsonString: string): ReturnType<typeof JSON.parse> | null {
		try {
			return JSON.parse(jsonString);
		}

		catch {
			return null;
		}
	}

	function verifySelector(assignment: NonNullable<ReturnType<Element['querySelector']>>, selector: string): NonNullable<ReturnType<Element['querySelector']>> | void {
		const element = assignment.querySelector(selector);

		return (element)
			? element
			: alert(`Incorrect selector: ${selector}`);
	}

	function parseCourseCode(overrides: { [key: string]: string; }): string | 'Unknown Course Code' {
		const parsedCourseCode = document.querySelector(CONSTANTS.SELECTORS.COURSE_CODE)?.innerHTML ?? 'Unknown Course Code';
		return overrides?.[parsedCourseCode] ?? parsedCourseCode;
	}

	function parseAvailableDate(assignment: NonNullable<ReturnType<Element['querySelector']>>): string {
		const availableStatus = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_STATUS);
		const availableDate = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_DATE);

		// If the AVAILABLE_STATUS class actually contains the 'available until' date, return an empty string
		if (availableStatus?.textContent?.trim() !== CONSTANTS.VALUES.NOT_AVAILABLE_STATUS) return '';

		return availableDate?.textContent?.trim() ?? '';
	}

	function parseAssignment(course: string, assignment: NonNullable<ReturnType<Element['querySelector']>>): InputAssignment[] {
		const assignmentTitle = verifySelector(assignment, classSelector(CONSTANTS.CLASSES.TITLE));

		// Ensure the configured selectors are valid
		if (!assignmentTitle?.textContent || !(assignmentTitle instanceof HTMLAnchorElement)) return [];

		return [{
			name: assignmentTitle.textContent.trim(),
			course,
			url: assignmentTitle.href,
			available: parseAvailableDate(assignment),
			due: assignment.querySelector(CONSTANTS.SELECTORS.DUE_DATE)?.textContent?.trim() ?? '',
		}];
	}

	const courseCodeOverrides = parseJSON(options.courseCodeOverrides);
	if (courseCodeOverrides === null) return alert(`The configured string for the Canvas Course Code Overrides option is not valid JSON.\n\nPlease verify this is a valid JSON object.\n\nCurrent configuration:\n${options.courseCodeOverrides}`);

	const assignments = document.getElementsByClassName(CONSTANTS.CLASSES.ASSIGNMENT);
	const parsedAssignments = Object.values(assignments).flatMap(assignment => parseAssignment(parseCourseCode(courseCodeOverrides), assignment));

	if (parsedAssignments.length) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		savedAssignments[parseCourseCode(courseCodeOverrides)] = parsedAssignments;
		chrome.storage.local.set({ savedAssignments });

		return parseCourseCode(courseCodeOverrides);
	}

	else alert('No Canvas assignments found on this page.\n\nPlease ensure this is a valid Canvas Course Assignments page.\n\nIf this is a valid assignments page, the Canvas Class Names options may be incorrect.');
}

import notionImport = require('./import');

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
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		if (!tab.id) return;

		const [{ result: courseCode }] = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: parseAssignments,
		});

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