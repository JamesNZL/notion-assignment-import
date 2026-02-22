import { CreatePageParameters, QueryDatabaseResponse, UpdatePageParameters } from '@notionhq/client/build/src/api-endpoints';

import TurndownService from 'turndown';
import { markdownToBlocks } from '@tryfabric/martian';

import { NotionClient } from '../apis/notion';
import { Storage } from '../apis/storage';

import { IFetchedAssignment } from './fetch';

import { EmojiRequest } from '../types/notion';
import { valueof, ArrayElement } from '../types/utils';

export async function exportToNotion(): Promise<void | {
	created: IFetchedAssignment[],
	updated: IFetchedAssignment[],
}> {
	const { notion: options, canvas: canvasOptions } = await Storage.getOptions();

	class FetchedAssignment implements IFetchedAssignment {
		private assignment: IFetchedAssignment;

		public constructor(assignment: IFetchedAssignment) {
			this.assignment = assignment;
		}

		public get name(): string {
			return this.assignment.name;
		}

		public get description(): string | null {
			return this.assignment.description;
		}

		public get points(): number {
			return this.assignment.points;
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

		public get available(): string | null {
			return this.assignment.available;
		}

		public get due(): string | null {
			return this.assignment.due;
		}

		private static verifySelectValue(value: string | null): Extract<valueof<CreatePageParameters['properties']>, { type?: 'select'; }>['select'] {
			return (value)
				? {
					name: value,
				}
				: null;
		}

		public getPageCreateParameters(databaseId: string): CreatePageParameters {
			const EMPTY_PROPERTY: unique symbol = Symbol('EMPTY_PROPERTY');

			const _properties: Record<string | symbol, CreatePageParameters['properties']> = {
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
					select: FetchedAssignment.verifySelectValue(options.propertyValues.categoryCanvas),
				},
				[options.propertyNames.course ?? EMPTY_PROPERTY]: {
					select: {
						name: this.course,
					},
				},
				[options.propertyNames.url ?? EMPTY_PROPERTY]: {
					url: this.url,
				},
				[options.propertyNames.points ?? EMPTY_PROPERTY]: {
					number: this.points ?? 0,
				},
				[(this.available && options.propertyNames.available) ?? EMPTY_PROPERTY]: {
					date: {
						start: this.available as string,
						time_zone: options.timeZone,
					},
				},
				[(this.due && options.propertyNames.due) ?? EMPTY_PROPERTY]: {
					date: {
						start: this.due as string,
						time_zone: options.timeZone,
					},
				},
				[(this.due && this.available && options.propertyNames.span) ?? EMPTY_PROPERTY]: {
					date: {
						start: this.available as string,
						end: this.due as string,
						time_zone: options.timeZone,
					},
				},
			};

			// remove the EMPTY_PROPERTY symbol property
			// symbol properties are not included in Object.entries() (and similar methods)
			const properties = Object.fromEntries(Object.entries(_properties));

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
				children: (this.description)
					? markdownToBlocks(
						new TurndownService().turndown(this.description),
					)
					: [],
			};
		}

		public getPageUpdateParameters(notionPage: NotionAssignment): UpdatePageParameters | null {
			const EMPTY_PROPERTY: unique symbol = Symbol('EMPTY_PROPERTY');

			/**
			 * @returns Whether the two dates are different.
			 */
			function compareDates(notionDate: string | undefined | null, fetchedDate: string) {
				if (!notionDate) return true;

				// Notion dates are buggered.
				// I hate timezones.
				// This is completely inane, but it works.
				// See reformatDate() in fetch.ts, and #89

				// Strip timezone information from Notion's date
				const notionTimestamp = Date.parse(notionDate.replace(/\+.+/, 'Z'));
				const canvasTimestamp = Date.parse(fetchedDate);

				// As long as the time is within a minute and a half.
				return (Math.abs(notionTimestamp - canvasTimestamp) > 90000);
			}

			const _properties: Record<string | symbol, UpdatePageParameters['properties']> = {
				[(options.importChanges.name && (notionPage.name !== this.name) && options.propertyNames.name) || EMPTY_PROPERTY]: {
					title: [
						{
							text: {
								content: this.name,
							},
						},
					],
				},
				[(options.importChanges.points && this.points && (notionPage.points !== this.points) && options.propertyNames.points) || EMPTY_PROPERTY]: {
					number: this.points ?? 0,
				},
				[(options.importChanges.available && this.available && compareDates(notionPage.available, this.available) && options.propertyNames.available) || EMPTY_PROPERTY]: {
					date: {
						start: this.available as string,
						time_zone: options.timeZone,
					},
				},
				[(options.importChanges.due && this.due && compareDates(notionPage.due, this.due) && options.propertyNames.due) || EMPTY_PROPERTY]: {
					date: {
						start: this.due as string,
						time_zone: options.timeZone,
					},
				},
				[(options.importChanges.span && this.due && this.available && (compareDates(notionPage.due, this.due) || compareDates(notionPage.available, this.available)) && options.propertyNames.span) || EMPTY_PROPERTY]: {
					date: {
						start: this.available as string,
						end: this.due as string,
						time_zone: options.timeZone,
					},
				},
			};

			// remove the EMPTY_PROPERTY symbol property
			// symbol properties are not included in Object.entries() (and similar methods)
			const properties = Object.fromEntries(Object.entries(_properties));
			if (!Object.keys(properties).length) return null;

			return <UpdatePageParameters>{
				page_id: notionPage.id,
				properties,
			};
		}
	}

	class NotionAssignment {
		private assignment: ArrayElement<QueryDatabaseResponse['results']>;

		public constructor(assignment: ArrayElement<QueryDatabaseResponse['results']>) {
			this.assignment = assignment;
		}

		public get id() {
			return this.assignment.id;
		}

		public get name() {
			try {
				if (!options.propertyNames.name) throw null;
				if (!('properties' in this.assignment) || !(options.propertyNames.name in this.assignment.properties)) throw null;

				const titleProperty = this.assignment.properties[options.propertyNames.name];
				if (!('title' in titleProperty) || !titleProperty?.title) throw null;

				return NotionClient.resolveTitle(this.assignment, false);
			}
			catch {
				return undefined;
			}
		}

		public get points() {
			try {
				if (!options.propertyNames.points) throw null;
				if (!('properties' in this.assignment) || !(options.propertyNames.points in this.assignment.properties)) throw null;

				const numberProperty = this.assignment.properties[options.propertyNames.points];
				if (!('number' in numberProperty) || !numberProperty?.number) throw null;

				return numberProperty.number;
			}
			catch {
				return undefined;
			}
		}

		public get course() {
			try {
				if (!options.propertyNames.course) throw null;
				if (!('properties' in this.assignment) || !(options.propertyNames.course in this.assignment.properties)) throw null;

				const selectProperty = this.assignment.properties[options.propertyNames.course];
				if (!('select' in selectProperty) || !selectProperty?.select) throw null;
				if (!('name' in selectProperty.select) || !selectProperty.select?.name) throw null;

				return selectProperty.select.name;
			}
			catch {
				return undefined;
			}
		}

		public get url() {
			try {
				if (!options.propertyNames.url) throw null;
				if (!('properties' in this.assignment) || !(options.propertyNames.url in this.assignment.properties)) throw null;

				const urlProperty = this.assignment.properties[options.propertyNames.url];
				if (!('url' in urlProperty) || !urlProperty?.url) throw null;

				return urlProperty.url;
			}
			catch {
				return undefined;
			}
		}

		public get available() {
			try {
				if (!options.propertyNames.available) throw null;
				if (!('properties' in this.assignment) || !(options.propertyNames.available in this.assignment.properties)) throw null;

				const dateProperty = this.assignment.properties[options.propertyNames.available];
				if (!('date' in dateProperty) || !dateProperty?.date) throw null;
				if (!('start' in dateProperty.date) || !dateProperty.date?.start) throw null;

				return dateProperty.date.start;
			}
			catch {
				return undefined;
			}
		}

		public get due() {
			try {
				if (!options.propertyNames.due) throw null;
				if (!('properties' in this.assignment) || !(options.propertyNames.due in this.assignment.properties)) throw null;

				const dateProperty = this.assignment.properties[options.propertyNames.due];
				if (!('date' in dateProperty) || !dateProperty?.date) throw null;
				if (!('start' in dateProperty.date) || !dateProperty.date?.start) throw null;

				return dateProperty.date.start;
			}
			catch {
				return undefined;
			}
		}

	}

	async function getAssignments(databaseId: string): Promise<{
		newAssignments: FetchedAssignment[];
		allFetchedAssignments: Record<string, FetchedAssignment>;
		allImportedAssignments: Record<string, NotionAssignment>;
	}> {

		async function getFetchedAssignments(): Promise<Record<string, FetchedAssignment>> {
			const savedAssignments = await Storage.getSavedAssignments();

			return Object.fromEntries(
				Object.values(savedAssignments)
					.flat()
					.filter(assignment => {
						if (!assignment.due) return canvasOptions.importMissingDueDates;
						return (options.importPastDueDates) || (Date.parse(assignment.due) > Date.now());
					})
					.map(assignment => [assignment.url, new FetchedAssignment(assignment)]),
			);
		}

		async function queryNotionAssignments(): Promise<void | Record<string, NotionAssignment>> {
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
				and: [canvasFilter, urlFilter].flatMap(filter => (filter) ? [filter] : []),
			};

			const notionAssignments = await notionClient.queryDatabase(databaseId, compoundFilter, { cache: false, force: true });

			if (!notionAssignments?.results) return;
			return Object.fromEntries(
				notionAssignments.results.map(assignment => {
					const notionAssignment = new NotionAssignment(assignment);
					return [notionAssignment.url, notionAssignment];
				}),
			);
		}

		const fetchedAssignments = await getFetchedAssignments();
		const notionAssignments = await queryNotionAssignments();

		if (!notionAssignments || !Object.values(notionAssignments).length) {
			return {
				newAssignments: Object.values(fetchedAssignments),
				allFetchedAssignments: fetchedAssignments,
				allImportedAssignments: {},
			};
		}

		// Find fetched canvas assignments that haven't already been created
		return {
			newAssignments: Object.values(fetchedAssignments).filter(assignment => !notionAssignments[assignment.url]),
			allFetchedAssignments: fetchedAssignments,
			allImportedAssignments: notionAssignments,
		};

	}

	// Set up Notion API handler

	const authorisation = await Storage.getNotionAuthorisation();

	if (!authorisation.accessToken || !options.databaseId) {
		const message = 'Invalid Notion Authorisation or Database.\n\nRefer to the extension set-up instructions on GitHub for more information.';
		if (typeof alert !== 'undefined') alert(message);
		console.error(message);
		return;
	}

	const notionClient = NotionClient.getInstance({ auth: authorisation.accessToken });

	const {
		newAssignments,
		allFetchedAssignments,
		allImportedAssignments,
	} = await getAssignments(options.databaseId);

	// Create assignments

	let errorCount = 0;
	const RETRY_COUNT = 3;

	async function createAssignment(assignment: FetchedAssignment, retryCount = 0): Promise<FetchedAssignment[]> {
		const page = await notionClient.createPage(assignment.getPageCreateParameters(<NonNullable<typeof options.databaseId>>options.databaseId));

		if (page) {
			console.log(`Created assignment ${assignment.course} ${assignment.name}`);
			return [assignment];
		}

		else if (retryCount >= RETRY_COUNT) {
			console.error(`Error creating assignment ${assignment.course} ${assignment.name}`);
			errorCount++;
			return [];
		}

		return await createAssignment(assignment, ++retryCount);
	}

	const createdAssignments = await Promise.all(newAssignments.map(createAssignment));

	if (errorCount) {
		const message = `An error was encountered when creating ${errorCount} assignments.`;
		if (typeof alert !== 'undefined') alert(message);
		console.error(message);
	}

	// Update changed assignments

	errorCount = 0;

	async function updateAssignment(assignment: FetchedAssignment, notionPage: NotionAssignment, retryCount = 0): Promise<FetchedAssignment[]> {
		const updateParameters = assignment.getPageUpdateParameters(notionPage);
		if (!updateParameters) return [];

		const page = await notionClient.updatePageProperties(updateParameters);

		if (page) {
			console.log(`Updated assignment ${assignment.course} ${assignment.name}`);
			return [assignment];
		}

		else if (retryCount >= RETRY_COUNT) {
			console.error(`Error updating assignment ${assignment.course} ${assignment.name}`);
			errorCount++;
			return [];
		}

		return await updateAssignment(assignment, notionPage, ++retryCount);
	}

	const updatedAssignments = await Promise.all(
		Object.values(allFetchedAssignments)
			.filter(assignment => allImportedAssignments[assignment.url])
			.map(assignment => updateAssignment(assignment, allImportedAssignments[assignment.url])),
	);

	if (errorCount) {
		const message = `An error was encountered when updating ${errorCount} assignments.`;
		if (typeof alert !== 'undefined') alert(message);
		console.error(message);
	}

	return {
		created: createdAssignments.flat(),
		updated: updatedAssignments.flat(),
	};
}