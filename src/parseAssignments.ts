export interface InputAssignment {
	name: string;
	course: string;
	url: string;
	available?: string;
	due?: string;
}

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

const classSelector = (className: string): string => `.${className}`;

const CONSTANTS: Constants = {
	COURSE: '****** ***',
	CLASSES: {
		ASSIGNMENT: 'assignment',
		TITLE: 'ig-title',
		AVAILABLE_DATE: 'assignment-date-available',
		AVAILABLE_STATUS: 'status-description',
		DUE_DATE: 'assignment-date-due',
		SCREENREADER_ONLY: 'screenreader-only',
	},
	SELECTORS: {
		get AVAILABLE_STATUS() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.AVAILABLE_STATUS)}`; },
		get AVAILABLE_DATE() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
		get DUE_DATE() { return `${classSelector(CONSTANTS.CLASSES.DUE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
	},
	VALUES: {
		NOT_AVAILABLE_STATUS: 'Not available until',
	},
};

const verifySelector = (assignment: NonNullable<ReturnType<Element['querySelector']>>, selector: string): NonNullable<ReturnType<Element['querySelector']>> | void => {
	const element = assignment.querySelector(selector);

	return (element)
		? element
		: console.error(`Incorrect selector: ${selector}`);
};

const parseAvailableDate = (assignment: NonNullable<ReturnType<Element['querySelector']>>): string => {
	const availableStatus = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_STATUS);
	const availableDate = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_DATE);

	// If the AVAILABLE_STATUS class actually contains the 'available until' date, return an empty string
	if (availableStatus?.textContent?.trim() !== CONSTANTS.VALUES.NOT_AVAILABLE_STATUS) return '';

	return availableDate?.textContent?.trim() ?? '';
};

const parseAssignment = (assignment: NonNullable<ReturnType<Element['querySelector']>>): InputAssignment | void => {
	const assignmentTitle = verifySelector(assignment, classSelector(CONSTANTS.CLASSES.TITLE));

	// Ensure the configured selectors are valid
	if (!assignmentTitle?.textContent || !(assignmentTitle instanceof HTMLAnchorElement)) return;

	return {
		name: assignmentTitle.textContent.trim(),
		course: CONSTANTS.COURSE,
		url: assignmentTitle.href,
		available: parseAvailableDate(assignment),
		due: assignment.querySelector(CONSTANTS.SELECTORS.DUE_DATE)?.textContent?.trim() ?? '',
	};
};

const parseButton = document.getElementById('parseButton');

if (parseButton) {
	parseButton.addEventListener('click', () => {
		const assignments = document.getElementsByClassName(CONSTANTS.CLASSES.ASSIGNMENT);

		const parsed = Object.values(assignments).map(assignment => parseAssignment(assignment));

		console.log(parsed);
	});
}