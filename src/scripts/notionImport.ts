import { CreatePageParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { TimeZoneRequest, EmojiRequest, NotionHandler } from './notionHandler';
import { Assignment, SavedAssignments } from './parseAssignments';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

interface Constants {
	TIMEZONE: TimeZoneRequest;
	PROPERTY_NAMES: {
		[key: string]: string;
	};
	PROPERTY_VALUES: {
		[key: string]: string;
	};
}

export async function notionImport(): Promise<void | Assignment[]> {
	const options = await chrome.storage.local.get({
		timezone: 'Pacific/Auckland',
		toDoName: 'Name',
		toDoCategory: 'Category',
		toDoCourse: 'Course',
		toDoURL: 'URL',
		toDoStatus: 'Status',
		toDoAvailable: 'Reminder',
		toDoDue: 'Due',
		toDoSpan: 'Date Span',
		categoryCanvas: 'Canvas',
		statusToDo: 'To Do',
	});

	const CONSTANTS: Constants = {
		TIMEZONE: options.timezone,
		PROPERTY_NAMES: {
			TO_DO_NAME: options.toDoName,
			TO_DO_CATEGORY: options.toDoCategory,
			TO_DO_COURSE: options.toDoCourse,
			TO_DO_URL: options.toDoURL,
			TO_DO_STATUS: options.toDoStatus,
			TO_DO_AVAIALBLE: options.toDoAvailable,
			TO_DO_DUE: options.toDoDue,
			TO_DO_SPAN: options.toDoSpan,
		},
		PROPERTY_VALUES: {
			CATEGORY_CANVAS: options.categoryCanvas,
			STATUS_TO_DO: options.statusToDo,
		},
	};

	class SavedAssignment implements Assignment {
		private assignment: Assignment;

		public constructor(assignment: Assignment) {
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

		public notionPageParameters(databaseId: string): CreatePageParameters {
			return {
				parent: {
					type: 'database_id',
					database_id: databaseId,
				},
				properties: {
					Name: {
						title: [
							{
								text: {
									content: this.name,
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
							name: this.course,
						},
					},
					[CONSTANTS.PROPERTY_NAMES.TO_DO_URL]: {
						url: this.url,
					},
					[CONSTANTS.PROPERTY_NAMES.TO_DO_STATUS]: {
						select: {
							name: CONSTANTS.PROPERTY_VALUES.STATUS_TO_DO,
						},
					},
					[CONSTANTS.PROPERTY_NAMES.TO_DO_AVAIALBLE]: {
						date: {
							start: this.available,
							time_zone: CONSTANTS.TIMEZONE,
						},
					},
					[CONSTANTS.PROPERTY_NAMES.TO_DO_DUE]: {
						date: {
							start: this.due,
							time_zone: CONSTANTS.TIMEZONE,
						},
					},
					[CONSTANTS.PROPERTY_NAMES.TO_DO_SPAN]: {
						date: {
							start: this.available,
							end: this.due,
							time_zone: CONSTANTS.TIMEZONE,
						},
					},
				},
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
			if ('properties' in this.assignment && CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE in this.assignment.properties) {
				// Extract the course property from the page
				const courseProperty = this.assignment.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE];

				// If the course property is a select property, return its name
				if ('select' in courseProperty) return courseProperty.select?.name;
			}

			// Return undefined if no select was found
			return undefined;
		}

		public get url(): string | undefined {
			if ('properties' in this.assignment && CONSTANTS.PROPERTY_NAMES.TO_DO_URL in this.assignment.properties) {
				const urlProperty = this.assignment.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_URL];

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
				.map(assignment => new SavedAssignment(assignment));
		}

		async function queryNotionAssignments(): Promise<void | NotionAssignment[]> {
			const filterForCanvasAssignments = {
				property: CONSTANTS.PROPERTY_NAMES.TO_DO_CATEGORY,
				select: {
					equals: CONSTANTS.PROPERTY_VALUES.CATEGORY_CANVAS,
				},
			};

			const notionAssignments = await notionHandler.queryDatabase(databaseId, filterForCanvasAssignments);

			return notionAssignments?.results?.map(assignment => new NotionAssignment(assignment));
		}

		const savedAssignments = await getSavedAssignments();
		const notionAssignments = await queryNotionAssignments();

		if (!notionAssignments?.length) return savedAssignments;

		return savedAssignments.filter(assignment => !notionAssignments.some(page => page.url === assignment.url));
	}

	// Set up Notion API handler

	const { notionKey: NOTION_KEY, databaseId: DATABASE_ID } = await chrome.storage.local.get(['notionKey', 'databaseId']);

	if (!NOTION_KEY || !DATABASE_ID) return alert('Invalid Notion Environment Variables.');

	const notionHandler = new NotionHandler({ auth: NOTION_KEY });

	// Create assignments

	const assignments = await getNewAssignments(DATABASE_ID);
	let errorCount = 0;

	const createdAssignments = await Promise.all(
		assignments.map(async assignment => {
			const page = await notionHandler.createPage(assignment.notionPageParameters(DATABASE_ID));

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