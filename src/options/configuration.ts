import { NullIfEmpty, SavedFields, SavedOptions } from './';
import {
	InputFieldValidator,
	StringField,
	RequiredStringField,
	RequiredNumberAsStringField,
	RequiredNotionKeyField,
	RequiredNotionDatabaseIdField,
	JSONStringObjectField,
	JSONEmojiObjectField,
	TimeZoneField,
} from './validator';

import { valueof } from '../types/utils';

export type SupportedTypes = NullIfEmpty<string> | boolean;

interface OptionConfiguration<T> {
	elementId: string;
	defaultValue: T;
	Validator?: InputFieldValidator;
	// default to 'input' if undefined
	validateOn?: 'input' | 'change';
}

function isOptionConfiguration(object: valueof<NestedConfigurationsOf<SavedOptions>> | OptionConfiguration<SupportedTypes>): object is OptionConfiguration<SupportedTypes> {
	const configurationProperties: (keyof OptionConfiguration<SupportedTypes>)[] = ['elementId', 'defaultValue'];
	return (<string[]>configurationProperties).every(key => Object.keys(object).includes(key));
}

type NestedConfigurationsOf<I> = {
	[K in keyof I]: I[K] extends SupportedTypes ? OptionConfiguration<I[K]> : NestedConfigurationsOf<I[K]>;
};

type IncompleteFieldKey<K extends string> = K extends keyof SavedFields
	? never
	: `${K}.${string}` extends keyof SavedFields
	? `${K}.${string}`
	: never;

export const CONFIGURATION: {
	FIELDS: Record<keyof SavedFields, OptionConfiguration<SupportedTypes>>;
	OPTIONS: NestedConfigurationsOf<SavedOptions>;
} = {
	get FIELDS() {
		function flattenOptions<K extends string>([keyPath, valueObject]: [keyof SavedFields | IncompleteFieldKey<K>, valueof<typeof CONFIGURATION['OPTIONS']>]): [keyof SavedFields, OptionConfiguration<SupportedTypes>][] {
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

		delete (<Partial<typeof CONFIGURATION>>this).FIELDS;
		return this.FIELDS = Object.fromEntries(
			(Object.entries(CONFIGURATION.OPTIONS) as Parameters<typeof flattenOptions>).flatMap(flattenOptions),
		) as Record<keyof SavedFields, OptionConfiguration<SupportedTypes>>;
	},
	OPTIONS: {
		timeZone: {
			elementId: 'timezone',
			defaultValue: 'Pacific/Auckland',
			Validator: new TimeZoneField('timezone'),
		},
		popup: {
			displayJSONButton: {
				elementId: 'show-json-button',
				defaultValue: false,
			},
		},
		options: {
			displayAdvanced: {
				elementId: 'show-advanced-options',
				defaultValue: false,
			},
		},
		canvas: {
			classNames: {
				breadcrumbs: {
					elementId: 'breadcrumbs',
					defaultValue: 'ic-app-crumbs',
					Validator: new RequiredStringField('breadcrumbs'),
				},
				assignment: {
					elementId: 'assignment-class',
					defaultValue: 'assignment',
					Validator: new RequiredStringField('assignment-class'),
				},
				title: {
					elementId: 'assignment-title',
					defaultValue: 'ig-title',
					Validator: new RequiredStringField('assignment-title'),
				},
				availableDate: {
					elementId: 'available-date',
					defaultValue: 'assignment-date-available',
					Validator: new RequiredStringField('available-date'),
				},
				availableStatus: {
					elementId: 'available-status',
					defaultValue: 'status-description',
					Validator: new RequiredStringField('available-status'),
				},
				dueDate: {
					elementId: 'due-date',
					defaultValue: 'assignment-date-due',
					Validator: new RequiredStringField('due-date'),
				},
				dateElement: {
					elementId: 'date-element',
					defaultValue: 'screenreader-only',
					Validator: new RequiredStringField('date-element'),
				},
			},
			classValues: {
				courseCodeN: {
					elementId: 'course-code-n',
					defaultValue: '2',
					Validator: new RequiredNumberAsStringField('course-code-n'),
				},
				notAvailable: {
					elementId: 'status-not-available',
					defaultValue: 'Not available until',
					Validator: new RequiredStringField('status-not-available'),
				},
			},
			courseCodeOverrides: {
				elementId: 'course-code-overrides',
				defaultValue: '{}',
				Validator: new JSONStringObjectField('course-code-overrides'),
			},
		},
		notion: {
			notionKey: {
				elementId: 'notion-key',
				defaultValue: null,
				Validator: new RequiredNotionKeyField('notion-key'),
				// only validate on change to avoid spamming the api
				validateOn: 'change',
			},
			databaseId: {
				elementId: 'database-id',
				defaultValue: null,
				Validator: new RequiredNotionDatabaseIdField('database-id'),
				validateOn: 'change',
			},
			propertyNames: {
				name: {
					elementId: 'notion-property-name',
					defaultValue: 'Name',
					Validator: new RequiredStringField('notion-property-name'),
				},
				category: {
					elementId: 'notion-property-category',
					defaultValue: 'Category',
					Validator: new StringField('notion-property-category'),
				},
				course: {
					elementId: 'notion-property-course',
					defaultValue: 'Course',
					Validator: new StringField('notion-property-course'),
				},
				url: {
					elementId: 'notion-property-url',
					defaultValue: 'URL',
					Validator: new StringField('notion-property-url'),
				},
				status: {
					elementId: 'notion-property-status',
					defaultValue: 'Status',
					Validator: new StringField('notion-property-status'),
				},
				available: {
					elementId: 'notion-property-available',
					defaultValue: 'Reminder',
					Validator: new StringField('notion-property-available'),
				},
				due: {
					elementId: 'notion-property-due',
					defaultValue: 'Due',
					Validator: new StringField('notion-property-due'),
				},
				span: {
					elementId: 'notion-property-span',
					defaultValue: 'Date Span',
					Validator: new StringField('notion-property-span'),
				},
			},
			propertyValues: {
				categoryCanvas: {
					elementId: 'notion-category-canvas',
					defaultValue: 'Canvas',
					Validator: new StringField('notion-category-canvas'),
				},
				statusToDo: {
					elementId: 'notion-status-todo',
					defaultValue: 'To Do',
					Validator: new StringField('notion-status-todo'),
				},
			},
			courseEmojis: {
				elementId: 'course-emojis',
				defaultValue: '{}',
				Validator: new JSONEmojiObjectField('course-emojis'),
			},
		},
	},
};