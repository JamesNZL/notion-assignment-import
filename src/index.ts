import { Client, isNotionClientError } from '@notionhq/client';
import { CreatePageParameters, CreatePageResponse, QueryDatabaseParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import * as dotenv from 'dotenv';
dotenv.config();

import fs = require('fs');
import * as chrono from 'chrono-node';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

interface Assignment {
	name: string;
	course: string;
	url: string;
	available?: string;
	due: string;
}

const CONSTANTS = {
	PROPERTY_NAMES: {
		TO_DO_NAME: 'Name',
		TO_DO_CATEGORY: 'Category',
		TO_DO_COURSE: 'Course',
		TO_DO_URL: 'URL',
		TO_DO_STATUS: 'Status',
		TO_DO_DUE: 'Due',
	},
	PROPERTY_VALUES: {
		CATEGORY_CANVAS: 'Canvas',
		STATUS_TO_DO: 'To Do',
	},
};

const notion = new Client({ auth: process.env.NOTION_KEY });

function handleError(error: unknown): void {
	const type = (isNotionClientError(error)) ? 'NOTION_ERROR' : 'UNKNOWN_ERROR';

	console.error({ type, error });
}

async function queryDatabase(databaseId: string, filter?: QueryDatabaseParameters['filter']): Promise<void | QueryDatabaseResponse> {
	try {
		return await notion.databases.query({ database_id: databaseId, filter });
	}

	catch (error: unknown) {
		handleError(error);
	}
}

async function createPage(parameters: CreatePageParameters): Promise<void | CreatePageResponse> {
	try {
		return await notion.pages.create(parameters);
	}

	catch (error: unknown) {
		handleError(error);
	}
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
	if (databaseId) {
		// Construct the parent object for the CreatePageParameters
		const parent: CreatePageParameters['parent'] = {
			type: 'database_id',
			database_id: databaseId,
		};

		// Construct the properties object
		// @ts-ignore
		const properties: CreatePageParameters['properties'] = {
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
			[CONSTANTS.PROPERTY_NAMES.TO_DO_DUE]: {
				date: {
					start: assignment.available,
					end: assignment.due,
					time_zone: 'Pacific/Auckland',
				},
			},
		};

		// Create the page
		// @ts-ignore
		return await createPage({ parent, properties });
	}
}

function readInputFile(filepath?: string): Assignment[] {
	if (!filepath || !fs.existsSync(filepath)) {
		console.error('Invalid input filepath!');
		process.exit(1);
	}

	else {
		const input: Assignment[] = JSON.parse(
			fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' }),
		);

		return input.map(assignment => {
			if (!assignment.available) assignment.available = new Date().toISOString();

			return {
				name: assignment.name,
				course: assignment.course,
				url: assignment.url,
				available: chrono.parseDate(assignment.available).toISOString(),
				due: chrono.parseDate(assignment.due).toISOString(),
			};
		});
	}
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

async function findNewAssignments(inputFilepath?: string, databaseId?: string): Promise<Assignment[]> {
	const input = readInputFile(inputFilepath);
	const existingAssignments = await findExistingAssignments(databaseId);

	if (!existingAssignments || !existingAssignments.results.length) return input;

	return input.filter(assignment => !existingAssignments.results.some(page => getAssignmentURL(page) === assignment.url));
}

findNewAssignments(process.env.INPUT_FILEPATH, process.env.TO_DO_ID)
	.then(assignments => {
		assignments.forEach(async assignment => {
			const page = await createAssignment(assignment, process.env.TO_DO_ID);

			console.log(page);
			console.log(`Created assignment ${assignment.course} ${assignment.name}`);
		});
	});