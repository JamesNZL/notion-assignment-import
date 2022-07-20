import { CanvasClient } from '../apis/canvas';
import { Storage } from '../apis/storage';

import { EmojiRequest } from '../types/notion';

export interface IParsedAssignment {
	name: string;
	description: string | null;
	points: number;
	course: string;
	icon: EmojiRequest | null;
	url: string;
	available: string;
	due: string;
}

export interface SavedAssignments {
	[course: string]: IParsedAssignment[];
}

function roundToNextHour(date: Date): Date {
	if (date.getMinutes() === 0) return date;

	date.setHours(date.getHours() + 1, 0, 0, 0);

	return date;
}

(async function fetchAssignments(): Promise<SavedAssignments | void> {
	try {
		const { origin, pathname } = window.location;
		const courseId = pathname.match(/\/courses\/([^/]+)\//)?.[1];

		if (!courseId) {
			throw 'This is an invalid Canvas course page.\n\nPlease navigate to a Canvas course page (or any subpage), and try again.\n\nExample: https://canvas.auckland.ac.nz/courses/72763/...';
		}

		const canvasClient = new CanvasClient({ origin, courseId });

		const [course, assignmentGroups] = await Promise.all([
			canvasClient.fetchCourse(),
			canvasClient.fetchAssignmentGroups(),
		]);

		if (!course || !assignmentGroups) {
			throw `Failed to fetch ${(!course) ? 'course' : 'assignments'}.\n\nPlease try again later.\n\nIf this issue persists, please open an Issue on GitHub or report it in the Discord Server.`;
		}

		const options = await Storage.getOptions();

		const courseCode = options.canvas.courseCodeOverrides[course.course_code] ?? course.course_code;
		const courseIcon = options.notion.courseEmojis[courseCode] ?? null;

		const emojiedCourseCode = `${(courseIcon) ? `${courseIcon} ` : ''}${courseCode}`;

		// TODO: sort by due date
		// TODO: filer !due_at
		const canvasAssignments = assignmentGroups.flatMap(group => group.assignments)
			.map(assignment => ({
				name: assignment.name,
				// TODO(main): html -> markdown
				description: assignment.description,
				// TODO(main): normalise this as a percentage of total points?
				points: assignment.points_possible,
				course: courseCode,
				icon: courseIcon,
				url: assignment.html_url,
				available: assignment.unlock_at ?? roundToNextHour(new Date()).toISOString(),
				due: assignment.due_at,
			}));

		const savedAssignments = await Storage.getSavedAssignments();

		savedAssignments[emojiedCourseCode] = canvasAssignments;

		await Promise.all([
			Storage.setSavedAssignments(savedAssignments),
			Storage.setSavedCourse(emojiedCourseCode),
		]);

		return savedAssignments;
	}

	catch (error) {
		alert(error);
		return Storage.setSavedCourse(null);
	}
})();