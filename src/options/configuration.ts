import { NullIfEmpty, SavedFields, SavedOptions } from './';
import { InputValidator, JSONEmojiObjectInput, JSONStringObjectInput, RequiredNumberInput, RequiredStringInput, StringInput } from './validator';

import { valueof } from '../types/utils';

interface OptionConfiguration<T> {
	elementId: string;
	defaultValue: T;
	inputValidator: { new(elementId: string, inputValue: NullIfEmpty<string>): InputValidator; };
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
			inputValidator: StringInput,
		},
		canvas: {
			classNames: {
				breadcrumbs: {
					elementId: 'breadcrumbs',
					defaultValue: 'ic-app-crumbs',
					inputValidator: RequiredStringInput,
				},
				assignment: {
					elementId: 'assignment-class',
					defaultValue: 'assignment',
					inputValidator: RequiredStringInput,
				},
				title: {
					elementId: 'assignment-title',
					defaultValue: 'ig-title',
					inputValidator: RequiredStringInput,
				},
				availableDate: {
					elementId: 'available-date',
					defaultValue: 'assignment-date-available',
					inputValidator: RequiredStringInput,
				},
				availableStatus: {
					elementId: 'available-status',
					defaultValue: 'status-description',
					inputValidator: RequiredStringInput,
				},
				dueDate: {
					elementId: 'due-date',
					defaultValue: 'assignment-date-due',
					inputValidator: RequiredStringInput,
				},
				dateElement: {
					elementId: 'date-element',
					defaultValue: 'screenreader-only',
					inputValidator: RequiredStringInput,
				},
			},
			classValues: {
				courseCodeN: {
					elementId: 'course-code-n',
					defaultValue: '2',
					inputValidator: RequiredNumberInput,
				},
				notAvailable: {
					elementId: 'status-not-available',
					defaultValue: 'Not available until',
					inputValidator: RequiredStringInput,
				},
			},
			courseCodeOverrides: {
				elementId: 'course-code-overrides',
				defaultValue: '{}',
				inputValidator: JSONStringObjectInput,
			},
		},
		notion: {
			notionKey: {
				elementId: 'notion-key',
				defaultValue: null,
				inputValidator: RequiredStringInput,
			},
			databaseId: {
				elementId: 'database-id',
				defaultValue: null,
				inputValidator: RequiredStringInput,
			},
			propertyNames: {
				name: {
					elementId: 'notion-property-name',
					defaultValue: 'Name',
					inputValidator: StringInput,
				},
				category: {
					elementId: 'notion-property-category',
					defaultValue: 'Category',
					inputValidator: StringInput,
				},
				course: {
					elementId: 'notion-property-course',
					defaultValue: 'Course',
					inputValidator: StringInput,
				},
				url: {
					elementId: 'notion-property-url',
					defaultValue: 'URL',
					inputValidator: StringInput,
				},
				status: {
					elementId: 'notion-property-status',
					defaultValue: 'Status',
					inputValidator: StringInput,
				},
				available: {
					elementId: 'notion-property-available',
					defaultValue: 'Reminder',
					inputValidator: StringInput,
				},
				due: {
					elementId: 'notion-property-due',
					defaultValue: 'Due',
					inputValidator: StringInput,
				},
				span: {
					elementId: 'notion-property-span',
					defaultValue: 'Date Span',
					inputValidator: StringInput,
				},
			},
			propertyValues: {
				categoryCanvas: {
					elementId: 'notion-category-canvas',
					defaultValue: 'Canvas',
					inputValidator: StringInput,
				},
				statusToDo: {
					elementId: 'notion-status-todo',
					defaultValue: 'To Do',
					inputValidator: StringInput,
				},
			},
			courseEmojis: {
				elementId: 'course-emojis',
				defaultValue: '{}',
				inputValidator: JSONEmojiObjectInput,
			},
		},
	},
};

export = CONFIGURATION;