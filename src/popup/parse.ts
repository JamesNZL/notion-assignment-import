import browser from 'webextension-polyfill';

import { parseDate } from 'chrono-node';
import { EmojiRequest } from '../apis/notion';
import { Options } from '../apis/options';

export interface IParsedAssignment {
	name: string;
	course: string;
	icon: EmojiRequest | null;
	url: string;
	available: string;
	due: string;
}

export interface SavedAssignments {
	[course: string]: IParsedAssignment[];
}

(async function parseAssignments(): Promise<void> {
	const options = await Options.getOptions();

	class CanvasAssignment {
		public static readonly INVALID_REQUIRED: unique symbol = Symbol('INVALID_REQUIRED');
		private static validSelectors = new Set();
		private static invalidSelectors = new Set();

		private assignment: NonNullable<ReturnType<Element['querySelector']>>;

		// if name, url, or due is INVALID_REQUIRED, !isValid()
		private name: string | typeof CanvasAssignment.INVALID_REQUIRED;
		private course: string;
		private icon: EmojiRequest | null;
		private url: string | typeof CanvasAssignment.INVALID_REQUIRED;
		private available: string;
		private due: string | typeof CanvasAssignment.INVALID_REQUIRED;

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
			return ![this.name, this.url, this.due].includes(CanvasAssignment.INVALID_REQUIRED);
		}

		public getCourse(): string | 'Unknown Course Code' {
			return `${(this.icon) ? `${this.icon} ` : ''}${this.course}`;
		}

		/**
		 * @returns `null` if `!this.isValid()`
		 */
		public toParsedAssignment(): IParsedAssignment | null {
			if (!this.isValid()) return null;

			return {
				name: <string>this.name,
				course: this.course,
				icon: this.icon,
				url: <string>this.url,
				available: this.available,
				due: <string>this.due,
			};
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

		private queryRequired(selector: string, verifySelector = true): void | Element {
			const element = CanvasAssignment.querySelector(this.assignment, selector, verifySelector);
			if (!element?.textContent) return;
			return element;
		}

		private parseTitle(): void | HTMLAnchorElement {
			const title = this.queryRequired(`.${options.canvas.classNames.title}`);
			return <HTMLAnchorElement>title;
		}

		private parseName(): string | typeof CanvasAssignment.INVALID_REQUIRED {
			return this.parseTitle()?.textContent?.trim() ?? CanvasAssignment.INVALID_REQUIRED;
		}

		private parseCourse(): string | 'Unknown Course Code' {
			const parsedCourseCode = CanvasAssignment.querySelector(document, options.canvas.selectors.courseCode)?.innerHTML ?? 'Unknown Course Code';

			return options.canvas.courseCodeOverrides[parsedCourseCode] ?? parsedCourseCode;
		}

		private queryIcon(): EmojiRequest | null {
			return options.notion.courseEmojis[this.course] ?? null;
		}

		private parseURL(): string | typeof CanvasAssignment.INVALID_REQUIRED {
			return this.parseTitle()?.href ?? CanvasAssignment.INVALID_REQUIRED;
		}

		private static getNextHour(): string {
			function roundToNextHour(date: Date): Date {
				if (date.getMinutes() === 0) return date;

				date.setHours(date.getHours() + 1, 0, 0, 0);

				return date;
			}

			return roundToNextHour(new Date()).toLocaleString('en-US', { timeZone: options.timeZone ?? undefined });
		}

		private parseAvailable(): string {
			const availableStatus = CanvasAssignment.querySelector(this.assignment, options.canvas.selectors.availableStatus, false);
			const availableDate = CanvasAssignment.querySelector(this.assignment, options.canvas.selectors.availableDate, false);

			// If the AVAILABLE_STATUS class actually contains the 'available until' date, return an empty string
			const availableString = (availableStatus?.textContent?.trim() !== options.canvas.classValues.notAvailable)
				? CanvasAssignment.getNextHour()
				: availableDate?.textContent?.trim() ?? CanvasAssignment.getNextHour();

			return parseDate(availableString, { timezone: options.timeZone ?? undefined }).toISOString();
		}

		private parseDue(): string | typeof CanvasAssignment.INVALID_REQUIRED {
			const dueString = this.queryRequired(options.canvas.selectors.dueDate, false)?.textContent?.trim();

			if (dueString) {
				const dueDate = parseDate(dueString, { timezone: options.timeZone ?? undefined });

				if (dueDate.valueOf() > Date.now()) return dueDate.toISOString();
			}

			// if due date was unable to be parsed, or if the due date is in the past, return INVALID_REQUIRED
			return CanvasAssignment.INVALID_REQUIRED;
		}
	}

	const assignments = document.getElementsByClassName(options.canvas.classNames.assignment);

	if (!assignments.length) return alert('No Canvas assignments were found on this page.\n\nPlease ensure this is a valid Canvas Course Assignments page.\n\nIf this is a Canvas Assignments page, the configured Canvas Class Names options may be incorrect.');

	const canvasAssignments = Object.values(assignments)
		.map(assignment => new CanvasAssignment(assignment))
		.filter(assignment => assignment.isValid());

	if (canvasAssignments.length) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await browser.storage.local.get({ savedAssignments: {} });

		savedAssignments[canvasAssignments[0].getCourse()] = <IParsedAssignment[]>canvasAssignments.map(assignment => assignment.toParsedAssignment()).filter(Boolean);

		await browser.storage.local.set({
			savedAssignments,
			savedCourse: canvasAssignments[0].getCourse(),
		});
	}

	else {
		alert('No valid assignments were found on this page.\n\nNOTE: Assignments without due dates are treated as invalid.');

		await browser.storage.local.set({ savedCourse: null });
	}
})();