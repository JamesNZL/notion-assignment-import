import browser from 'webextension-polyfill';

import { CreatePageParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { EmojiRequest, NotionClient } from '../apis/notion';
import { Options } from '../apis/options';

import { IParsedAssignment, SavedAssignments } from './parse';

import { valueof, ArrayElement } from '../types/utils';

export async function exportToNotion(): Promise<void | IParsedAssignment[]> {
	const { notion: options } = await Options.getOptions();

	class ParsedAssignment implements IParsedAssignment {
		private assignment: IParsedAssignment;

		public constructor(assignment: IParsedAssignment) {
			this.assignment = assignment;
		}

		public get name(): string {
			return this.assignment.name;
		}

		public get course(): string {
			return this.assignment.course;
		}

		public get icon(): EmojiRequest | null {
			return this.assignment.icon;
		}

		public get url(): string {
			return this.assignment.url;
		}

		public get available(): string {
			return this.assignment.available;
		}

		public get due(): string {
			return this.assignment.due;
		}

		private static verifySelectValue(value: string | null): Extract<valueof<CreatePageParameters['properties']>, { type?: 'select'; }>['select'] {
			return (value)
				? {
					name: value,
				}
				: null;
		}

		public getPageParameters(databaseId: string): CreatePageParameters {
			const EMPTY_PROPERTY: unique symbol = Symbol('EMPTY_PROPERTY');

			const _properties: Record<string | symbol, valueof<CreatePageParameters['properties']>> = {
				[options.propertyNames.name ?? EMPTY_PROPERTY]: {
					title: [
						{
							text: {
								content: this.name,
							},
						},
					],
				},
				[options.propertyNames.category ?? EMPTY_PROPERTY]: {
					select: ParsedAssignment.verifySelectValue(options.propertyValues.categoryCanvas),
				},
				[options.propertyNames.course ?? EMPTY_PROPERTY]: {
					select: {
						name: this.course,
					},
				},
				[options.propertyNames.url ?? EMPTY_PROPERTY]: {
					url: this.url,
				},
				[options.propertyNames.status ?? EMPTY_PROPERTY]: {
					select: ParsedAssignment.verifySelectValue(options.propertyValues.statusToDo),
				},
				[options.propertyNames.available ?? EMPTY_PROPERTY]: {
					date: {
						start: this.available,
						time_zone: options.timeZone,
					},
				},
				[options.propertyNames.due ?? EMPTY_PROPERTY]: {
					date: {
						start: this.due,
						time_zone: options.timeZone,
					},
				},
				[options.propertyNames.span ?? EMPTY_PROPERTY]: {
					date: {
						start: this.available,
						end: this.due,
						time_zone: options.timeZone,
					},
				},
			};

			// remove the EMPTY_PROPERTY symbol property
			// symbol properties are not included in Object.entries() (and similar methods)
			const properties: CreatePageParameters['properties'] = Object.fromEntries(Object.entries(_properties));

			return <CreatePageParameters>{
				parent: {
					database_id: databaseId,
					type: 'database_id',
				},
				properties,
				icon: (this.icon)
					? {
						emoji: this.icon,
					}
					: null,
			};
		}
	}

	class NotionAssignment {
		private assignment: ArrayElement<QueryDatabaseResponse['results']>;

		public constructor(assignment: ArrayElement<QueryDatabaseResponse['results']>) {
			this.assignment = assignment;
		}

		public get name(): string {
			return ('properties' in this.assignment && 'title' in this.assignment.properties.Name) ? this.assignment.properties.Name.title.map(({ plain_text }) => plain_text).join('') : '';
		}

		public get course(): string | undefined {
			if (!options.propertyNames.course) return undefined;

			if ('properties' in this.assignment && options.propertyNames.course in this.assignment.properties) {
				// Extract the course property from the page
				const courseProperty = this.assignment.properties[options.propertyNames.course];

				// If the course property is a select property, return its name
				if ('select' in courseProperty) return courseProperty.select?.name;
			}

			// Return undefined if no select was found
			return undefined;
		}

		public get url(): string | undefined {
			if (!options.propertyNames.url) return undefined;

			if ('properties' in this.assignment && options.propertyNames.url in this.assignment.properties) {
				const urlProperty = this.assignment.properties[options.propertyNames.url];

				if ('url' in urlProperty && urlProperty?.url) return urlProperty.url;
			}

			return undefined;
		}
	}

	async function getNewAssignments(databaseId: string): Promise<ParsedAssignment[]> {
		async function getSavedAssignments(): Promise<ParsedAssignment[]> {
			const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await browser.storage.local.get({ savedAssignments: {} });

			return Object.values(savedAssignments)
				.flat()
				.map(assignment => new ParsedAssignment(assignment))
				.filter(assignment => Date.parse(assignment.due) > Date.now());
		}

		async function queryNotionAssignments(): Promise<void | NotionAssignment[]> {
			const filterForCanvasAssignments = (options.propertyNames.category)
				? {
					property: options.propertyNames.category,
					select: (options.propertyValues.categoryCanvas)
						? {
							equals: options.propertyValues.categoryCanvas,
						}
						: {
							is_empty: <const>true,
						},
				}
				: undefined;

			const notionAssignments = await notionClient.queryDatabase(databaseId, filterForCanvasAssignments);

			return notionAssignments?.results?.map(assignment => new NotionAssignment(assignment));
		}

		const savedAssignments = await getSavedAssignments();
		const notionAssignments = await queryNotionAssignments();

		if (!notionAssignments?.length) return savedAssignments;

		return savedAssignments.filter(assignment => !notionAssignments.some(page => page.url === assignment.url));
	}

	alert('Work in progress.');
	return [];

	// Set up Notion API handler

	// if (!options.notionKey || !options.databaseId) return alert('Invalid Notion Integration Key or Database ID.\n\nRefer to the extension set-up instructions on GitHub for more information.');

	const notionClient = new NotionClient({ auth: 'options.notionKey' });

	// Create assignments

	const assignments = await getNewAssignments('options.databaseId');
	let errorCount = 0;

	const createdAssignments = await Promise.all(
		assignments.map(async assignment => {
			const page = await notionClient.createPage(assignment.getPageParameters('<NonNullable<typeof options.databaseId>>options.databaseId'));

			if (page) {
				console.log(`Created assignment ${assignment.course} ${assignment.name}`);
				return [assignment];
			}

			else {
				console.error(`Error creating assignment ${assignment.course} ${assignment.name}`);
				errorCount++;
				return [];
			}
		}),
	);

	if (errorCount) alert(`An error was encountered when creating ${errorCount} assignments.`);

	return createdAssignments.flat();
}