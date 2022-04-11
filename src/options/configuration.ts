import { SavedFields, SavedOptions } from './options';

import { valueof } from '../types/utils';

interface OptionConfiguration<T> {
	elementId: string;
	defaultValue: T;
}

function isOptionConfiguration(object: NestedConfigurationsOf<unknown> | OptionConfiguration<unknown>): object is OptionConfiguration<unknown> {
	const configurationProperties: (keyof OptionConfiguration<unknown>)[] = ['elementId', 'defaultValue'];
	return Object.keys(object).every(key => (<string[]>configurationProperties).includes(key));
}

type NestedConfigurationsOf<I> = {
	[K in keyof I]: I[K] extends object ? NestedConfigurationsOf<I[K]> : OptionConfiguration<I[K]>;
};

type IncompleteFieldKey<K extends string> = K extends keyof SavedFields
	? never
	: `${K}.${string}` extends keyof SavedFields
	? `${K}.${string}`
	: never;

const CONFIGURATION: {
	FIELDS: Record<keyof SavedFields, OptionConfiguration<unknown>>;
	OPTIONS: NestedConfigurationsOf<SavedOptions>;
} = {
	get FIELDS() {
		function flattenOptions<K extends string>([keyPath, valueObject]: [keyof SavedFields | IncompleteFieldKey<K>, valueof<typeof CONFIGURATION['OPTIONS']>]): [keyof SavedFields, OptionConfiguration<unknown>][] {
			if (!isOptionConfiguration(valueObject)) {
				// the current valueObject is a NestedConfigurationsOf<>,
				// where Object.values(valueObject) is of type { [key: string]: NestedConfigurationOf<> | OptionConfiguration<> }[]
				return Object.entries(valueObject)
					.flatMap(([nestedKey, nestedValueObject]) => {
						const nestedKeyPath = <keyof SavedFields | IncompleteFieldKey<typeof keyPath>>`${keyPath}.${nestedKey}`;
						return flattenOptions<typeof keyPath>([nestedKeyPath, nestedValueObject]);
					});
			}
			// the current valueObject is a single OptionConfiguration<>
			return [[<keyof SavedFields>keyPath, valueObject]];
		}

		delete (<Partial<typeof this>>this).FIELDS;
		return this.FIELDS = Object.fromEntries(
			(Object.entries(CONFIGURATION.OPTIONS) as Parameters<typeof flattenOptions>).flatMap(flattenOptions),
		) as Record<keyof SavedFields, OptionConfiguration<unknown>>;
	},
	OPTIONS: {
		timeZone: {
			elementId: 'timezone',
			defaultValue: 'Pacific/Auckland',
		},
		canvas: {
			classNames: {
				breadcrumbs: {
					elementId: 'breadcrumbs',
					defaultValue: 'ic-app-crumbs',
				},
				assignment: {
					elementId: 'assignment-class',
					defaultValue: 'assignment',
				},
				title: {
					elementId: 'assignment-title',
					defaultValue: 'ig-title',
				},
				availableDate: {
					elementId: 'available-date',
					defaultValue: 'assignment-date-available',
				},
				availableStatus: {
					elementId: 'available-status',
					defaultValue: 'status-description',
				},
				dueDate: {
					elementId: 'due-date',
					defaultValue: 'assignment-date-due',
				},
				dateElement: {
					elementId: 'date-element',
					defaultValue: 'screenreader-only',
				},
			},
			classValues: {
				courseCodeN: {
					elementId: 'course-code-n',
					defaultValue: '2',
				},
				notAvailable: {
					elementId: 'status-not-available',
					defaultValue: 'Not available until',
				},
			},
			courseCodeOverrides: {
				elementId: 'course-code-overrides',
				defaultValue: '{}',
			},
		},
		notion: {
			notionKey: {
				elementId: 'notion-key',
				defaultValue: null,
			},
			databaseId: {
				elementId: 'database-id',
				defaultValue: null,
			},
			propertyNames: {
				name: {
					elementId: 'notion-property-name',
					defaultValue: 'Name',
				},
				category: {
					elementId: 'notion-property-category',
					defaultValue: 'Category',
				},
				course: {
					elementId: 'notion-property-course',
					defaultValue: 'Course',
				},
				url: {
					elementId: 'notion-property-url',
					defaultValue: 'URL',
				},
				status: {
					elementId: 'notion-property-status',
					defaultValue: 'Status',
				},
				available: {
					elementId: 'notion-property-available',
					defaultValue: 'Reminder',
				},
				due: {
					elementId: 'notion-property-due',
					defaultValue: 'Due',
				},
				span: {
					elementId: 'notion-property-span',
					defaultValue: 'Date Span',
				},
			},
			propertyValues: {
				categoryCanvas: {
					elementId: 'notion-category-canvas',
					defaultValue: 'Canvas',
				},
				statusToDo: {
					elementId: 'notion-status-todo',
					defaultValue: 'To Do',
				},
			},
			courseEmojis: {
				elementId: 'course-emojis',
				defaultValue: '{}',
			},
		},
	},
};

export = CONFIGURATION;