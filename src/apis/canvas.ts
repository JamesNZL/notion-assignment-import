import { Course, Assignments, AssignmentGroups } from '../types/canvas';

export class CanvasClient {
	private origin: string;
	private courseId: string;
	private baseURL: string;

	public constructor({ origin, courseId }: {
		// TODO(main): style: use semicolons
		origin: string,
		courseId: string;
	}) {
		this.origin = origin;
		this.courseId = courseId;

		this.baseURL = `${origin}/api/v1`;
	}

	private get ENDPOINTS() {
		return {
			course: `${this.baseURL}/courses/${this.courseId}`,
			assignments: `${this.baseURL}/courses/${this.courseId}/assignments`,
			assignmentGroups: `${this.baseURL}/courses/${this.courseId}/assignment_groups`,
		};
	}

	private async makeRequest<R>(endpoint: string): Promise<R | void> {
		try {
			return await (await fetch(endpoint)).json();
		}
		catch (error) {
			console.error({ error });
		}
	}

	public async fetchCourse() {
		return await this.makeRequest<Course>(this.ENDPOINTS.course);
	}

	public async fetchAssignments() {
		return await this.makeRequest<Assignments>(this.ENDPOINTS.assignments);
	}

	public async fetchAssignmentGroups() {
		return await this.makeRequest<AssignmentGroups>(
			this.ENDPOINTS.assignmentGroups + '?' + new URLSearchParams({
				'include[]': 'assignments',
			}),
		);
	}
}