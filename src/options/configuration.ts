import { SavedFields, SavedOptions } from './';
import {
	ValidatorConstructor,
	StringField,
	RequiredStringField,
	RequiredNumberField,
	RequiredNotionKeyField,
	RequiredNotionDatabaseIdField,
	JSONStringObjectField,
	JSONEmojiObjectField,
	TimeZoneField,
} from './validator';

import { valueof } from '../types/utils';

interface OptionConfiguration<T> {
	elementId: string;
	defaultValue: T;
	Validator: ValidatorConstructor;
	// default to 'input' if undefined
	validateOn?: 'input' | 'change';
}

function isOptionConfiguration(object: NestedConfigurationsOf<unknown> | OptionConfiguration<unknown>): object is OptionConfiguration<unknown> {
	const configurationProperties: (keyof OptionConfiguration<unknown>)[] = ['elementId', 'defaultValue', 'Validator'];
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

export const CONFIGURATION: {
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
		// TODO: validate timezone
		timeZone: {
			elementId: 'timezone',
			defaultValue: 'Pacific/Auckland',
			Validator: TimeZoneField,
		},
		canvas: {
			classNames: {
				breadcrumbs: {
					elementId: 'breadcrumbs',
					defaultValue: 'ic-app-crumbs',
					Validator: RequiredStringField,
				},
				assignment: {
					elementId: 'assignment-class',
					defaultValue: 'assignment',
					Validator: RequiredStringField,
				},
				title: {
					elementId: 'assignment-title',
					defaultValue: 'ig-title',
					Validator: RequiredStringField,
				},
				availableDate: {
					elementId: 'available-date',
					defaultValue: 'assignment-date-available',
					Validator: RequiredStringField,
				},
				availableStatus: {
					elementId: 'available-status',
					defaultValue: 'status-description',
					Validator: RequiredStringField,
				},
				dueDate: {
					elementId: 'due-date',
					defaultValue: 'assignment-date-due',
					Validator: RequiredStringField,
				},
				dateElement: {
					elementId: 'date-element',
					defaultValue: 'screenreader-only',
					Validator: RequiredStringField,
				},
			},
			classValues: {
				courseCodeN: {
					elementId: 'course-code-n',
					defaultValue: '2',
					Validator: RequiredNumberField,
				},
				notAvailable: {
					elementId: 'status-not-available',
					defaultValue: 'Not available until',
					Validator: RequiredStringField,
				},
			},
			courseCodeOverrides: {
				elementId: 'course-code-overrides',
				defaultValue: '{}',
				Validator: JSONStringObjectField,
			},
		},
		notion: {
			notionKey: {
				elementId: 'notion-key',
				defaultValue: null,
				Validator: RequiredNotionKeyField,
				// only validate on change to avoid spamming the api
				validateOn: 'change',
			},
			databaseId: {
				elementId: 'database-id',
				defaultValue: null,
				Validator: RequiredNotionDatabaseIdField,
				validateOn: 'change',
			},
			propertyNames: {
				name: {
					elementId: 'notion-property-name',
					defaultValue: 'Name',
					Validator: RequiredStringField,
				},
				category: {
					elementId: 'notion-property-category',
					defaultValue: 'Category',
					Validator: StringField,
				},
				course: {
					elementId: 'notion-property-course',
					defaultValue: 'Course',
					Validator: StringField,
				},
				url: {
					elementId: 'notion-property-url',
					defaultValue: 'URL',
					Validator: StringField,
				},
				status: {
					elementId: 'notion-property-status',
					defaultValue: 'Status',
					Validator: StringField,
				},
				available: {
					elementId: 'notion-property-available',
					defaultValue: 'Reminder',
					Validator: StringField,
				},
				due: {
					elementId: 'notion-property-due',
					defaultValue: 'Due',
					Validator: StringField,
				},
				span: {
					elementId: 'notion-property-span',
					defaultValue: 'Date Span',
					Validator: StringField,
				},
			},
			propertyValues: {
				categoryCanvas: {
					elementId: 'notion-category-canvas',
					defaultValue: 'Canvas',
					Validator: StringField,
				},
				statusToDo: {
					elementId: 'notion-status-todo',
					defaultValue: 'To Do',
					Validator: StringField,
				},
			},
			courseEmojis: {
				elementId: 'course-emojis',
				defaultValue: '{}',
				Validator: JSONEmojiObjectField,
			},
		},
	},
};