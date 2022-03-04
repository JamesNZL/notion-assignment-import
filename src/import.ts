import { Client, isNotionClientError } from '@notionhq/client';
import { CreatePageParameters, CreatePageResponse, QueryDatabaseParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { InputAssignment } from './parseAssignments';

type PageProperties = CreatePageParameters['properties'];
type DateRequest = NonNullable<NonNullable<Extract<PageProperties[keyof PageProperties], { type?: 'date'; }>['date']>>;
type TimeZoneRequest = DateRequest['time_zone'];

interface PaginatedRequest {
	start_cursor?: string;
	page_size?: number;
}

interface PaginatedResponse {
	has_more: boolean;
	next_cursor: string;
	results: object[];
	object: 'list';
}

function isPaginatedResponse<R>(response: void | R): response is (R & PaginatedResponse) {
	if (!response) return false;

	return 'has_more' in response;
}

import * as chrono from 'chrono-node';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

interface Assignment extends InputAssignment {
	available: string;
	due: string;
}

interface Constants {
	TIMEZONE: TimeZoneRequest;
	PROPERTY_NAMES: {
		[key: string]: string;
	};
	PROPERTY_VALUES: {
		[key: string]: string;
	};
}

export = async function notionImport() {
	// TODO: store in extension options
	const CONSTANTS: Constants = {
		TIMEZONE: 'Pacific/Auckland',
		PROPERTY_NAMES: {
			TO_DO_NAME: 'Name',
			TO_DO_CATEGORY: 'Category',
			TO_DO_COURSE: 'Course',
			TO_DO_URL: 'URL',
			TO_DO_STATUS: 'Status',
			TO_DO_AVAIALBLE: 'Reminder',
			TO_DO_DUE: 'Due',
			TO_DO_SPAN: 'Date Span',
		},
		PROPERTY_VALUES: {
			CATEGORY_CANVAS: 'Canvas',
			STATUS_TO_DO: 'To Do',
		},
	};

	const { notionKey: NOTION_KEY, databaseId: TO_DO_ID } = await chrome.storage.local.get(['notionKey', 'databaseId']);

	if (!NOTION_KEY || !TO_DO_ID) return alert('Invalid Notion Environment Variables.');

	const notion = new Client({ auth: NOTION_KEY });

	async function makeRequest<T, R>(method: (arg: T) => Promise<R>, parameters: T): Promise<void | R> {
		try {
			return await method(parameters);
		}

		catch (error: unknown) {
			const type = (isNotionClientError(error)) ? 'NOTION_ERROR' : 'UNKNOWN_ERROR';

			console.error({ type, error });
		}
	}

	async function makePaginatedRequest<T, R>(method: (arg: T) => Promise<R>, parameters: T & PaginatedRequest): Promise<void | R> {
		let response = await makeRequest(method, parameters);

		if (isPaginatedResponse(response)) {
			const _results = response.results;

			while (isPaginatedResponse(response) && response.has_more) {
				parameters.start_cursor = response.next_cursor;

				response = await makeRequest(method, parameters);

				if (isPaginatedResponse(response)) _results.push(...response.results);
			}

			if (isPaginatedResponse(response)) response.results = _results;
		}

		return response;
	}

	async function queryDatabase(databaseId: string, filter?: QueryDatabaseParameters['filter']): Promise<void | QueryDatabaseResponse> {
		return await makePaginatedRequest<QueryDatabaseParameters, QueryDatabaseResponse>(
			notion.databases.query,
			{
				database_id: databaseId,
				filter,
			},
		);
	}

	async function createPage(parameters: CreatePageParameters): Promise<void | CreatePageResponse> {
		return await makeRequest<CreatePageParameters, CreatePageResponse>(
			notion.pages.create,
			parameters,
		);
	}

	function resolveAssignmentName(page: ArrayElement<QueryDatabaseResponse['results']>): string {
		return ('properties' in page && 'title' in page.properties.Name) ? page.properties.Name.title.map(({ plain_text }) => plain_text).join('') : '';
	}

	function getAssignmentCourse(page: ArrayElement<QueryDatabaseResponse['results']>): string | undefined {
		if ('properties' in page && CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE in page.properties) {
			// Extract the course property from the page
			const courseProperty = page.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE];

			// If the course property is a select property, return its name
			if ('select' in courseProperty) return courseProperty.select?.name;
		}

		// Return undefined if no select was found
		return undefined;
	}

	function getAssignmentURL(page: ArrayElement<QueryDatabaseResponse['results']>): string | undefined {
		if ('properties' in page && CONSTANTS.PROPERTY_NAMES.TO_DO_URL in page.properties) {
			const urlProperty = page.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_URL];

			if ('url' in urlProperty && urlProperty?.url) return urlProperty.url;
		}

		return undefined;
	}

	async function createAssignment(assignment: Assignment, databaseId?: string): Promise<void | CreatePageResponse> {
		if (databaseId && assignment.available && assignment.due) {
			// Construct the parent object for the CreatePageParameters
			const parent: CreatePageParameters['parent'] = {
				type: 'database_id',
				database_id: databaseId,
			};

			// Construct the properties object
			const properties: PageProperties = {
				Name: {
					title: [
						{
							text: {
								content: assignment.name,
							},
						},
					],
				},
				[CONSTANTS.PROPERTY_NAMES.TO_DO_CATEGORY]: {
					select: {
						name: CONSTANTS.PROPERTY_VALUES.CATEGORY_CANVAS,
					},
				},
				[CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE]: {
					select: {
						name: assignment.course,
					},
				},
				[CONSTANTS.PROPERTY_NAMES.TO_DO_URL]: {
					url: assignment.url,
				},
				[CONSTANTS.PROPERTY_NAMES.TO_DO_STATUS]: {
					select: {
						name: CONSTANTS.PROPERTY_VALUES.STATUS_TO_DO,
					},
				},
				[CONSTANTS.PROPERTY_NAMES.TO_DO_AVAIALBLE]: {
					date: {
						start: assignment.available,
						time_zone: CONSTANTS.TIMEZONE,
					},
				},
				[CONSTANTS.PROPERTY_NAMES.TO_DO_DUE]: {
					date: {
						start: assignment.due,
						time_zone: CONSTANTS.TIMEZONE,
					},
				},
				[CONSTANTS.PROPERTY_NAMES.TO_DO_SPAN]: {
					date: {
						start: assignment.available,
						end: assignment.due,
						time_zone: CONSTANTS.TIMEZONE,
					},
				},
			};

			// Create the page
			return await createPage({ parent, properties });
		}
	}

	function roundToNextHour(date: Date): Date {
		if (date.getMinutes() === 0) return date;

		date.setHours(date.getHours() + 1, 0, 0, 0);

		return date;
	}

	async function readInput(): Promise<Assignment[]> {
		const { savedAssignments } = await chrome.storage.local.get({ savedAssignments: [] });

		return (<InputAssignment[][]>savedAssignments)
			.flat()
			.flatMap(assignment => {
				if (!assignment.available) assignment.available = roundToNextHour(new Date()).toLocaleString('en-US', { timeZone: CONSTANTS.TIMEZONE ?? undefined });

				if (!assignment.due) {
					console.log(`Skipping assignment ${assignment.course} ${assignment.name} as no due date`);
					return [];
				}

				return [{
					name: assignment.name,
					course: assignment.course,
					url: assignment.url,
					available: chrono.parseDate(assignment.available, { timezone: CONSTANTS.TIMEZONE ?? undefined }).toISOString(),
					due: chrono.parseDate(assignment.due, { timezone: CONSTANTS.TIMEZONE ?? undefined }).toISOString(),
				}];
			});
	}

	async function findExistingAssignments(databaseId?: string): Promise<void | QueryDatabaseResponse> {
		if (databaseId) {
			const filterForCanvasAssignments = {
				property: CONSTANTS.PROPERTY_NAMES.TO_DO_CATEGORY,
				select: {
					equals: CONSTANTS.PROPERTY_VALUES.CATEGORY_CANVAS,
				},
			};

			return await queryDatabase(databaseId, filterForCanvasAssignments);
		}
	}

	async function findNewAssignments(databaseId?: string): Promise<Assignment[]> {
		const input = await readInput();
		const existingAssignments = await findExistingAssignments(databaseId);

		if (!existingAssignments || !existingAssignments.results.length) return input;

		return input.filter(assignment => !existingAssignments.results.some(page => getAssignmentURL(page) === assignment.url));
	}

	findNewAssignments(TO_DO_ID)
		.then(assignments => {
			assignments.forEach(async assignment => {
				const page = await createAssignment(assignment, TO_DO_ID);

				if (page) console.log(`Created assignment ${assignment.course} ${assignment.name}`);
				else console.error(`Error creating assignment ${assignment.course} ${assignment.name}`);
			});
		});
};