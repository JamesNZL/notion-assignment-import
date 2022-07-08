import { CreatePageParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { EmojiRequest, NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';

import { IParsedAssignment } from './parse';

import { valueof, ArrayElement } from '../types/utils';

export async function exportToNotion(): Promise<void | IParsedAssignment[]> {
	const { notion: options } = await Storage.getOptions();

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
		private client: NotionClient;
		private assignment: ArrayElement<QueryDatabaseResponse['results']>;

		public constructor(client: NotionClient, assignment: ArrayElement<QueryDatabaseResponse['results']>) {
			this.client = client;
			this.assignment = assignment;
		}

		public async getURL() {
			try {
				if (!options.propertyNames.url) throw null;

				if (!('properties' in this.assignment) || !(options.propertyNames.url in this.assignment.properties)) throw null;

				const urlPropertyId = this.assignment.properties[options.propertyNames.url].id;

				const urlProperty = await this.client.retrievePageProperty(this.assignment.id, urlPropertyId);

				if (!urlProperty || !('url' in urlProperty) || !urlProperty?.url) throw null;

				return urlProperty.url;
			}
			catch {
				return undefined;
			}
		}
	}

	async function getNewAssignments(databaseId: string): Promise<ParsedAssignment[]> {
		async function getParsedAssignments(): Promise<ParsedAssignment[]> {
			const savedAssignments = await Storage.getSavedAssignments();

			return Object.values(savedAssignments)
				.flat()
				.map(assignment => new ParsedAssignment(assignment))
				.filter(assignment => Date.parse(assignment.due) > Date.now());
		}

		async function queryNotionAssignments(): Promise<void | NotionAssignment[]> {
			const canvasFilter = (options.propertyNames.category)
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

			const urlFilter = (options.propertyNames.url)
				? {
					property: options.propertyNames.url,
					url: {
						is_not_empty: <const>true,
					},
				}
				: undefined;

			const compoundFilter = {
				// using flatMap for the in-built type safety
				and: [canvasFilter, urlFilter].flatMap(filter => (filter) ? [filter] : []),
			};

			const notionAssignments = await notionClient.queryDatabase(databaseId, compoundFilter, { cache: false, force: true });

			return notionAssignments?.results.map(assignment => new NotionAssignment(notionClient, assignment));
		}

		const parsedAssignments = await getParsedAssignments();
		const notionAssignments = await queryNotionAssignments();

		if (!notionAssignments?.length) return parsedAssignments;

		const existingURLs = await Promise.all(notionAssignments.map(page => page.getURL()));

		return parsedAssignments.filter(assignment => !existingURLs.includes(assignment.url));
	}

	// Set up Notion API handler

	const authorisation = await Storage.getNotionAuthorisation();

	if (!authorisation.accessToken || !options.databaseId) return alert('Invalid Notion Authorisation or Database.\n\nRefer to the extension set-up instructions on GitHub for more information.');

	const notionClient = NotionClient.getInstance({ auth: authorisation.accessToken });

	// Create assignments

	const assignments = await getNewAssignments(options.databaseId);
	let errorCount = 0;

	const createdAssignments = await Promise.all(
		assignments.map(async assignment => {
			const page = await notionClient.createPage(assignment.getPageParameters(<NonNullable<typeof options.databaseId>>options.databaseId));

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