import { parseDate } from 'chrono-node';
import { EmojiRequest } from '../api-handlers/notion';
import { getOptions } from '../options/options';

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
	const options = await getOptions();

	class CanvasAssignment {
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

			return roundToNextHour(new Date()).toLocaleString('en-US', { timeZone: options.timeZone ?? undefined });
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

		public toParsedAssignment(): IParsedAssignment {
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
			const title = this.queryRequired(`.${options.canvas.classNames.title}`);
			return <HTMLAnchorElement>title;
		}

		private parseName(): string | '' {
			return this.parseTitle()?.textContent?.trim() ?? '';
		}

		private parseCourse(): string | 'Unknown Course Code' {
			const parsedCourseCode = CanvasAssignment.querySelector(document, options.canvas.selectors.courseCode)?.innerHTML ?? 'Unknown Course Code';

			return options.canvas.courseCodeOverrides[parsedCourseCode] ?? parsedCourseCode;
		}

		private queryIcon(): EmojiRequest | null {
			return options.notion.courseEmojis[this.course] ?? null;
		}

		private parseURL(): string | '' {
			return this.parseTitle()?.href ?? '';
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

		private parseDue(): string | '' {
			const dueString = this.queryRequired(options.canvas.selectors.dueDate, false)?.textContent?.trim();

			if (dueString) {
				const dueDate = parseDate(dueString, { timezone: options.timeZone ?? undefined });

				if (dueDate.valueOf() > Date.now()) return dueDate.toISOString();
				else this.setInvalid();
			}

			// if due date was unable to be parsed, or if the due date is in the past, return ''
			return '';
		}
	}

	const assignments = document.getElementsByClassName(options.canvas.classNames.assignment);

	if (!assignments.length) return alert('No Canvas assignments were found on this page.\n\nPlease ensure this is a valid Canvas Course Assignments page.\n\nIf this is a Canvas Assignments page, the configured Canvas Class Names options may be incorrect.');

	const canvasAssignments = Object.values(assignments)
		.map(assignment => new CanvasAssignment(assignment))
		.filter(assignment => assignment.isValid());

	if (canvasAssignments.length) {
		const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

		savedAssignments[canvasAssignments[0].getCourse()] = canvasAssignments.map(assignment => assignment.toParsedAssignment());

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