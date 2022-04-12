import { SavedFields, SavedOptions } from './';
import {
	ValidatorConstructor,
	StringField,
	RequiredStringField,
	RequiredNumberField,
	JSONStringObjectField,
	JSONEmojiObjectField,
} from './validator';

import { valueof } from '../types/utils';

interface OptionConfiguration<T> {
	elementId: string;
	defaultValue: T;
	validator: ValidatorConstructor;
}

function isOptionConfiguration(object: NestedConfigurationsOf<unknown> | OptionConfiguration<unknown>): object is OptionConfiguration<unknown> {
	const configurationProperties: (keyof OptionConfiguration<unknown>)[] = ['elementId', 'defaultValue', 'validator'];
	return (<string[]>configurationProperties).every(key => Object.keys(object).includes(key));
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
			validator: StringField,
		},
		canvas: {
			classNames: {
				breadcrumbs: {
					elementId: 'breadcrumbs',
					defaultValue: 'ic-app-crumbs',
					validator: RequiredStringField,
				},
				assignment: {
					elementId: 'assignment-class',
					defaultValue: 'assignment',
					validator: RequiredStringField,
				},
				title: {
					elementId: 'assignment-title',
					defaultValue: 'ig-title',
					validator: RequiredStringField,
				},
				availableDate: {
					elementId: 'available-date',
					defaultValue: 'assignment-date-available',
					validator: RequiredStringField,
				},
				availableStatus: {
					elementId: 'available-status',
					defaultValue: 'status-description',
					validator: RequiredStringField,
				},
				dueDate: {
					elementId: 'due-date',
					defaultValue: 'assignment-date-due',
					validator: RequiredStringField,
				},
				dateElement: {
					elementId: 'date-element',
					defaultValue: 'screenreader-only',
					validator: RequiredStringField,
				},
			},
			classValues: {
				courseCodeN: {
					elementId: 'course-code-n',
					defaultValue: '2',
					validator: RequiredNumberField,
				},
				notAvailable: {
					elementId: 'status-not-available',
					defaultValue: 'Not available until',
					validator: RequiredStringField,
				},
			},
			courseCodeOverrides: {
				elementId: 'course-code-overrides',
				defaultValue: '{}',
				validator: JSONStringObjectField,
			},
		},
		notion: {
			notionKey: {
				elementId: 'notion-key',
				defaultValue: null,
				validator: RequiredStringField,
			},
			databaseId: {
				elementId: 'database-id',
				defaultValue: null,
				validator: RequiredStringField,
			},
			propertyNames: {
				name: {
					elementId: 'notion-property-name',
					defaultValue: 'Name',
					validator: RequiredStringField,
				},
				category: {
					elementId: 'notion-property-category',
					defaultValue: 'Category',
					validator: StringField,
				},
				course: {
					elementId: 'notion-property-course',
					defaultValue: 'Course',
					validator: StringField,
				},
				url: {
					elementId: 'notion-property-url',
					defaultValue: 'URL',
					validator: StringField,
				},
				status: {
					elementId: 'notion-property-status',
					defaultValue: 'Status',
					validator: StringField,
				},
				available: {
					elementId: 'notion-property-available',
					defaultValue: 'Reminder',
					validator: StringField,
				},
				due: {
					elementId: 'notion-property-due',
					defaultValue: 'Due',
					validator: StringField,
				},
				span: {
					elementId: 'notion-property-span',
					defaultValue: 'Date Span',
					validator: StringField,
				},
			},
			propertyValues: {
				categoryCanvas: {
					elementId: 'notion-category-canvas',
					defaultValue: 'Canvas',
					validator: StringField,
				},
				statusToDo: {
					elementId: 'notion-status-todo',
					defaultValue: 'To Do',
					validator: StringField,
				},
			},
			courseEmojis: {
				elementId: 'course-emojis',
				defaultValue: '{}',
				validator: JSONEmojiObjectField,
			},
		},
	},
};

export = CONFIGURATION;