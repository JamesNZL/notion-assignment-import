import * as chrono from 'chrono-node';
import { EmojiRequest } from './notionHandler';

export interface Assignment {
	name: string;
	course: string;
	icon: EmojiRequest | null;
	url: string;
	available: string;
	due: string;
}

export interface SavedAssignments {
	[course: string]: Assignment[];
}

interface Constants {
	TIMEZONE: string;
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

(async function parseAssignments(): Promise<void> {
	const classSelector = (className: string): string => `.${className}`;

	const options = await chrome.storage.local.get({
		timezone: 'Pacific/Auckland',
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
		courseEmojis: '{}',
	});

	const CONSTANTS: Constants = {
		TIMEZONE: options.timezone,
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

	class CanvasAssignment {
		public static courseCodeOverrides = CanvasAssignment.parseOption(options.courseCodeOverrides, 'Canvas Course Code Overrides');
		public static courseEmojis = CanvasAssignment.parseOption(options.courseEmojis, 'Notion Course Emojis');

		private static validSelectors = new Set();
		private static invalidSelectors = new Set();

		private valid = true;
		private assignment: NonNullable<ReturnType<Element['querySelector']>>;

		// if name, url, or due is '', !isValid()
		private name: string | '';
		private course: string;
		private icon: EmojiRequest | null;
		private url: string | '';
		private available: string;
		private due: string | '';

		private static parseOption(text: string, option: string): ReturnType<typeof JSON.parse> | Record<string, never> {
			try {
				return JSON.parse(text);
			}

			catch {
				alert(`The configured string for the ${option} option is not valid JSON.\n\nPlease verify this is a valid JSON object.\n\nCurrent configuration: \n${text}`);
				return {};
			}
		}

		private static querySelector(parent: ParentNode, selector: string, verifySelector = true): NonNullable<ReturnType<Element['querySelector']>> | void {
			const element = parent.querySelector(selector);

			if (element) {
				CanvasAssignment.validSelectors.add(selector);
				return element;
			}

			else if (verifySelector && !CanvasAssignment.validSelectors.has(selector) && !CanvasAssignment.invalidSelectors.has(selector)) {
				CanvasAssignment.invalidSelectors.add(selector);
				alert(`Incorrect selector: ${selector}`);
			}
		}

		private static getNextHour(): string {
			function roundToNextHour(date: Date): Date {
				if (date.getMinutes() === 0) return date;

				date.setHours(date.getHours() + 1, 0, 0, 0);

				return date;
			}

			return roundToNextHour(new Date()).toLocaleString('en-US', { timeZone: CONSTANTS.TIMEZONE ?? undefined });
		}

		public constructor(assignment: NonNullable<ReturnType<Element['querySelector']>>) {
			this.assignment = assignment;

			this.name = this.parseName();
			this.course = this.parseCourse();
			this.icon = this.queryIcon();
			this.url = this.parseURL();
			this.available = this.parseAvailable();
			this.due = this.parseDue();
		}

		public isValid(): boolean {
			return this.valid;
		}

		public getCourse(): string | 'Unknown Course Code' {
			return `${(this.icon) ? `${this.icon} ` : ''}${this.course}`;
		}

		public toAssignment(): Assignment {
			return {
				name: this.name,
				course: this.course,
				icon: this.icon,
				url: this.url,
				available: this.available,
				due: this.due,
			};
		}

		private setInvalid() {
			this.valid = false;
		}

		private queryRequired(selector: string, verifySelector = true): void | Element {
			const element = CanvasAssignment.querySelector(this.assignment, selector, verifySelector);
			if (!element?.textContent) return this.setInvalid();
			return element;
		}

		private parseTitle(): void | HTMLAnchorElement {
			const title = this.queryRequired(classSelector(CONSTANTS.CLASSES.TITLE));
			return <HTMLAnchorElement>title;
		}

		private parseName(): string | '' {
			return this.parseTitle()?.textContent?.trim() ?? '';
		}

		private parseCourse(): string | 'Unknown Course Code' {
			const parsedCourseCode = CanvasAssignment.querySelector(document, CONSTANTS.SELECTORS.COURSE_CODE)?.innerHTML ?? 'Unknown Course Code';

			return CanvasAssignment.courseCodeOverrides?.[parsedCourseCode] ?? parsedCourseCode;
		}

		private queryIcon(): EmojiRequest | null {
			return CanvasAssignment.courseEmojis?.[this.course] ?? null;
		}

		private parseURL(): string | '' {
			return this.parseTitle()?.href ?? '';
		}

		private parseAvailable(): string {
			const availableStatus = CanvasAssignment.querySelector(this.assignment, CONSTANTS.SELECTORS.AVAILABLE_STATUS, false);
			const availableDate = CanvasAssignment.querySelector(this.assignment, CONSTANTS.SELECTORS.AVAILABLE_DATE, false);

			// If the AVAILABLE_STATUS class actually contains the 'available until' date, return an empty string
			const availableString = (availableStatus?.textContent?.trim() !== CONSTANTS.VALUES.NOT_AVAILABLE_STATUS)
				? CanvasAssignment.getNextHour()
				: availableDate?.textContent?.trim() ?? CanvasAssignment.getNextHour();

			return chrono.parseDate(availableString, { timezone: CONSTANTS.TIMEZONE ?? undefined }).toISOString();
		}

		private parseDue(): string | '' {
			const dueString = this.queryRequired(CONSTANTS.SELECTORS.DUE_DATE, false)?.textContent?.trim();

			if (dueString) {
				const dueDate = chrono.parseDate(dueString, { timezone: CONSTANTS.TIMEZONE ?? undefined });

				if (dueDate.valueOf() > Date.now()) return dueDate.toISOString();
				else this.setInvalid();
			}

			// if due date was unable to be parsed, or if the due date is in the past, return ''
			return '';
		}
	}

	const assignments = document.getElementsByClassName(CONSTANTS.CLASSES.ASSIGNMENT);

	if (!assignments.length) return alert('No Canvas assignments were found on this page.\n\nPlease ensure this is a valid Canvas Course Assignments page.\n\nIf this is a Canvas Assignments page, the configured Canvas Class Names options may be incorrect.');

	const canvasAssignments = Object.values(assignments)
		.map(assignment => new CanvasAssignment(assignment))
		.filter(assignment => assignment.isValid());

	if (canvasAssignments.length) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		savedAssignments[canvasAssignments[0].getCourse()] = canvasAssignments.map(assignment => assignment.toAssignment());

		await chrome.storage.local.set({
			savedAssignments,
			savedCourse: canvasAssignments[0].getCourse(),
		});
	}

	else {
		alert('No valid assignments were found on this page.\n\nNOTE: Assignments without due dates are treated as invalid.');

		await chrome.storage.local.set({
			savedCourse: '',
		});
	}
})();