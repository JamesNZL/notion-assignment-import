import { NullIfEmpty, SavedFields, SavedOptions } from './';
import {
	InputFieldValidator,
	StringField,
	RequiredStringField,
	RequiredNumberAsStringField,
	JSONStringObjectField,
	JSONEmojiObjectField,
	TimeZoneField,
	RequiredNotionDatabaseIdField,
} from './validator';

import { valueof } from '../types/utils';

export type SupportedTypes = NullIfEmpty<string> | boolean;

interface OptionConfiguration<T> {
	readonly elementId: string;
	readonly defaultValue: T;
	validator?: InputFieldValidator;
	// default to 'input' if undefined
	readonly validateOn?: 'input' | 'change';
	readonly dependents?: readonly string[];
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
} = <const>{
	get FIELDS() {
		function flattenOptions<K extends string>([keyPath, valueObject]: [keyof SavedFields | IncompleteFieldKey<K>, valueof<typeof CONFIGURATION['OPTIONS']>]): [keyof SavedFields, OptionConfiguration<SupportedTypes>][] {
			// the current valueObject is a single OptionConfiguration<>
			if (isOptionConfiguration(valueObject)) return [[<keyof SavedFields>keyPath, valueObject]];

			// the current valueObject is a NestedConfigurationsOf<>,
			// where Object.values(valueObject) is of type { [key: string]: NestedConfigurationOf<> | OptionConfiguration<> }[]
			return Object.entries(valueObject)
				.flatMap(([nestedKey, nestedValueObject]) => {
					const nestedKeyPath = <keyof SavedFields | IncompleteFieldKey<typeof keyPath>>`${keyPath}.${nestedKey}`;
					return flattenOptions<typeof keyPath>([nestedKeyPath, nestedValueObject]);
				});
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
			get validator() {
				delete this.validator;
				return this.validator = new TimeZoneField('timezone');
			},
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
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('breadcrumbs');
					},
				},
				assignment: {
					elementId: 'assignment-class',
					defaultValue: 'assignment',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('assignment-class');
					},
				},
				title: {
					elementId: 'assignment-title',
					defaultValue: 'ig-title',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('assignment-title');
					},
				},
				availableDate: {
					elementId: 'available-date',
					defaultValue: 'assignment-date-available',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('available-date');
					},
				},
				availableStatus: {
					elementId: 'available-status',
					defaultValue: 'status-description',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('available-status');
					},
				},
				dueDate: {
					elementId: 'due-date',
					defaultValue: 'assignment-date-due',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('due-date');
					},
				},
				dateElement: {
					elementId: 'date-element',
					defaultValue: 'screenreader-only',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('date-element');
					},
				},
			},
			classValues: {
				courseCodeN: {
					elementId: 'course-code-n',
					defaultValue: '2',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredNumberAsStringField('course-code-n');
					},
				},
				notAvailable: {
					elementId: 'status-not-available',
					defaultValue: 'Not available until',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('status-not-available');
					},
				},
			},
			courseCodeOverrides: {
				elementId: 'course-code-overrides',
				defaultValue: '{}',
				get validator() {
					delete this.validator;
					return this.validator = new JSONStringObjectField('course-code-overrides');
				},
			},
		},
		notion: {
			databaseId: {
				elementId: 'database-id',
				defaultValue: null,
				get validator() {
					delete this.validator;
					return this.validator = new RequiredNotionDatabaseIdField('database-id');
				},
				validateOn: 'change',
				dependents: [
					'notion-property-name',
					'notion-property-category',
					'notion-property-course',
					'notion-property-url',
					'notion-property-available',
					'notion-property-due',
					'notion-property-span',
					'notion-category-canvas',
				],
			},
			propertyNames: {
				name: {
					elementId: 'notion-property-name',
					defaultValue: 'Name',
					get validator() {
						delete this.validator;
						return this.validator = new RequiredStringField('notion-property-name');
					},
					validateOn: 'change',
				},
				category: {
					elementId: 'notion-property-category',
					defaultValue: 'Category',
					get validator() {
						delete this.validator;
						return this.validator = new StringField('notion-property-category');
					},
					dependents: ['notion-category-canvas'],
				},
				course: {
					elementId: 'notion-property-course',
					defaultValue: 'Course',
					get validator() {
						delete this.validator;
						return this.validator = new StringField('notion-property-course');
					},
				},
				url: {
					elementId: 'notion-property-url',
					defaultValue: 'URL',
					get validator() {
						delete this.validator;
						return this.validator = new StringField('notion-property-url');
					},
				},
				available: {
					elementId: 'notion-property-available',
					defaultValue: 'Reminder',
					get validator() {
						delete this.validator;
						return this.validator = new StringField('notion-property-available');
					},
				},
				due: {
					elementId: 'notion-property-due',
					defaultValue: 'Due',
					get validator() {
						delete this.validator;
						return this.validator = new StringField('notion-property-due');
					},
				},
				span: {
					elementId: 'notion-property-span',
					defaultValue: 'Date Span',
					get validator() {
						delete this.validator;
						return this.validator = new StringField('notion-property-span');
					},
				},
			},
			propertyValues: {
				categoryCanvas: {
					elementId: 'notion-category-canvas',
					defaultValue: 'Canvas',
					get validator() {
						delete this.validator;
						return this.validator = new StringField('notion-category-canvas');
					},
				},
			},
			courseEmojis: {
				elementId: 'course-emojis',
				defaultValue: '{}',
				get validator() {
					delete this.validator;
					return this.validator = new JSONEmojiObjectField('course-emojis');
				},
			},
		},
	},
};