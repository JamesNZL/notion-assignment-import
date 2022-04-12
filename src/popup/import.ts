import { CreatePageParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { EmojiRequest, NotionHandler } from '../api-handlers/notion';
import { getOptions } from '../options/options';
import { ParsedAssignment, SavedAssignments } from './parse';

import { valueof, ArrayElement } from '../types/utils';

export async function exportToNotion(): Promise<void | ParsedAssignment[]> {
	const { notion: options } = await getOptions();

	class SavedAssignment implements ParsedAssignment {
		private assignment: ParsedAssignment;

		public constructor(assignment: ParsedAssignment) {
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

		public notionPageParameters(databaseId: string): CreatePageParameters {
			const _properties: CreatePageParameters['properties'] = {
				[options.propertyNames.name ?? '']: {
					title: [
						{
							text: {
								content: this.name,
							},
						},
					],
				},
				[options.propertyNames.category ?? '']: {
					select: SavedAssignment.verifySelectValue(options.propertyValues.categoryCanvas),
				},
				[options.propertyNames.course ?? '']: {
					select: {
						name: this.course,
					},
				},
				[options.propertyNames.url ?? '']: {
					url: this.url,
				},
				[options.propertyNames.status ?? '']: {
					select: SavedAssignment.verifySelectValue(options.propertyValues.statusToDo),
				},
				[options.propertyNames.available ?? '']: {
					date: {
						start: this.available,
						time_zone: options.timeZone,
					},
				},
				[options.propertyNames.due ?? '']: {
					date: {
						start: this.due,
						time_zone: options.timeZone,
					},
				},
				[options.propertyNames.span ?? '']: {
					date: {
						start: this.available,
						end: this.due,
						time_zone: options.timeZone,
					},
				},
			};

			return {
				parent: {
					type: 'database_id',
					database_id: databaseId,
				},
				properties: Object.fromEntries(Object.entries(_properties).filter(([propertyName]) => propertyName !== '')),
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

	async function getNewAssignments(databaseId: string): Promise<SavedAssignment[]> {
		async function getSavedAssignments(): Promise<SavedAssignment[]> {
			const { savedAssignments } = <{ savedAssignments: SavedAssignments; }>await chrome.storage.local.get({ savedAssignments: {} });

			return Object.values(savedAssignments)
				.flat()
				.map(assignment => new SavedAssignment(assignment))
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

			const notionAssignments = await notionHandler.queryDatabase(databaseId, filterForCanvasAssignments);

			return notionAssignments?.results?.map(assignment => new NotionAssignment(assignment));
		}

		const savedAssignments = await getSavedAssignments();
		const notionAssignments = await queryNotionAssignments();

		if (!notionAssignments?.length) return savedAssignments;

		return savedAssignments.filter(assignment => !notionAssignments.some(page => page.url === assignment.url));
	}

	// Set up Notion API handler

	if (!options.notionKey || !options.databaseId) return alert('Invalid Notion Integration Key or Database ID.\n\nRefer to the extension set-up instructions on GitHub for more information.');

	const notionHandler = new NotionHandler({ auth: options.notionKey });

	// Create assignments

	const assignments = await getNewAssignments(options.databaseId);
	let errorCount = 0;

	const createdAssignments = await Promise.all(
		assignments.map(async assignment => {
			const page = await notionHandler.createPage(assignment.notionPageParameters(<NonNullable<typeof options.databaseId>>options.databaseId));

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