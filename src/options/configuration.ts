import { Input, KeyValueGroup, SegmentedControl } from '../elements';

import { NullIfEmpty, SavedFields, SavedOptions } from './';
import {
	InputFieldValidator,
	StringField,
	RequiredStringField,
	RequiredNumberAsStringField,
	TimeZoneField,
	RequiredNotionTokenField,
	RequiredNotionDatabaseIdField,
} from './validator';

import { valueof } from '../types/utils';

export type SupportedTypes = NullIfEmpty<string> | boolean;

interface Readable {
	getValue(): SupportedTypes;
	validate(force?: boolean): Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT>;
}

interface Settable {
	setValue(value: SupportedTypes, dispatchEvent?: boolean): void;
}

interface Displayable {
	show(): void;
	hide(): void;
}

interface Dependable {
	toggleDependents(dependents: readonly string[]): void;
}

interface Subscribable {
	addEventListener(...args: Parameters<typeof HTMLElement.prototype.addEventListener>): void;
	dispatchInputEvent(bubbles?: boolean): void;
}

interface HasPlaceholder {
	setPlaceholder(placeholder: unknown): void;
}

interface OptionConfiguration<T> {
	readonly defaultValue: T;
	input: Readable & Settable & Displayable & Dependable & Subscribable & Partial<HasPlaceholder>;
	// default to 'input' if undefined
	readonly validateOn?: 'input' | 'change';
	readonly dependents?: readonly InputElementId[];
}

function isOptionConfiguration(object: valueof<NestedConfigurationsOf<SavedOptions>> | OptionConfiguration<SupportedTypes>): object is OptionConfiguration<SupportedTypes> {
	const configurationProperties: (keyof OptionConfiguration<SupportedTypes>)[] = ['defaultValue', 'input'];
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

interface InputElements {
	'timeZone': 'timezone';
	'extension.displayTheme': 'display-theme';
	displaySystemMode: 'display-system-mode';
	displayLightMode: 'display-light-mode';
	displayDarkMode: 'display-dark-mode';
	'popup.displayJSONButton': 'display-json-button';
	hideJSONButton: 'hide-json-button';
	showJSONButton: 'show-json-button';
	'options.displayAdvanced': 'display-advanced-options';
	hideAdvancedOptions: 'hide-advanced-options';
	showAdvancedOptions: 'show-advanced-options';
	'canvas.classNames.breadcrumbs': 'breadcrumbs';
	'canvas.classNames.assignment': 'assignment-class';
	'canvas.classNames.title': 'assignment-title';
	'canvas.classNames.availableDate': 'available-date';
	'canvas.classNames.availableStatus': 'available-status';
	'canvas.classNames.dueDate': 'due-date';
	'canvas.classNames.dateElement': 'date-element';
	'canvas.classValues.courseCodeN': 'course-code-n';
	'canvas.classValues.notAvailable': 'status-not-available';
	'canvas.courseCodeOverrides': 'course-code-overrides-group';
	courseCodesCanvas: 'course-code-overrides-canvas';
	courseCodesNotion: 'course-code-overrides-notion';
	'notion.accessToken': 'notion-token';
	'notion.databaseId': 'database-id';
	refreshDatabaseSelect: 'refresh-database-select';
	'notion.propertyNames.name': 'notion-property-name';
	'notion.propertyNames.category': 'notion-property-category';
	'notion.propertyNames.course': 'notion-property-course';
	'notion.propertyNames.url': 'notion-property-url';
	'notion.propertyNames.available': 'notion-property-available';
	'notion.propertyNames.due': 'notion-property-due';
	'notion.propertyNames.span': 'notion-property-span';
	'notion.propertyValues.categoryCanvas': 'notion-category-canvas';
	'notion.courseEmojis': 'course-emojis-group';
	courseEmojisCodes: 'course-emojis-codes';
	courseEmojisEmojis: 'course-emojis-emojis';
}

type InputElementId = valueof<InputElements>;

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
			defaultValue: 'Pacific/Auckland',
			get input() {
				delete (<Partial<typeof this>>this).input;
				return this.input = Input.getInstance<InputElementId>('timezone', 'input', TimeZoneField);
			},
		},
		extension: {
			displayTheme: {
				defaultValue: null,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>('display-theme', 'segmented control', [
						{
							id: 'display-system-mode',
							value: null,
							default: true,
						},
						{
							id: 'display-light-mode',
							value: 'light',
						},
						{
							id: 'display-dark-mode',
							value: 'dark',
						},
					]);
				},
			},
		},
		popup: {
			displayJSONButton: {
				defaultValue: false,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>('display-json-button', 'segmented control', [
						{
							id: 'hide-json-button',
							value: false,
							default: true,
						},
						{
							id: 'show-json-button',
							value: true,
							showDependents: true,
						},
					]);
				},
			},
		},
		options: {
			displayAdvanced: {
				defaultValue: false,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>('display-advanced-options', 'segmented control', [
						{
							id: 'hide-advanced-options',
							value: false,
							default: true,
						},
						{
							id: 'show-advanced-options',
							value: true,
							showDependents: true,
						},
					]);
				},
			},
		},
		canvas: {
			classNames: {
				breadcrumbs: {
					defaultValue: 'ic-app-crumbs',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('breadcrumbs', 'input', RequiredStringField);
					},
				},
				assignment: {
					defaultValue: 'assignment',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('assignment-class', 'input', RequiredStringField);
					},
				},
				title: {
					defaultValue: 'ig-title',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('assignment-title', 'input', RequiredStringField);
					},
				},
				availableDate: {
					defaultValue: 'assignment-date-available',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('available-date', 'input', RequiredStringField);
					},
				},
				availableStatus: {
					defaultValue: 'status-description',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('available-status', 'input', RequiredStringField);
					},
				},
				dueDate: {
					defaultValue: 'assignment-date-due',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('due-date', 'input', RequiredStringField);
					},
				},
				dateElement: {
					defaultValue: 'screenreader-only',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('date-element', 'input', RequiredStringField);
					},
				},
			},
			classValues: {
				courseCodeN: {
					defaultValue: '2',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('course-code-n', 'input', RequiredNumberAsStringField);
					},
				},
				notAvailable: {
					defaultValue: 'Not available until',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('status-not-available', 'input', RequiredStringField);
					},
				},
			},
			courseCodeOverrides: {
				defaultValue: '{}',
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = KeyValueGroup.getInstance<InputElementId>('course-code-overrides-group', 'course-code-overrides-canvas', 'course-code-overrides-notion');
				},
			},
		},
		notion: {
			accessToken: {
				defaultValue: null,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = Input.getInstance<InputElementId>('notion-token', 'input', RequiredNotionTokenField);
				},
				dependents: [
					'database-id',
					'refresh-database-select',
				],
			},
			databaseId: {
				defaultValue: null,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = Input.getInstance<InputElementId>('database-id', 'input', RequiredNotionDatabaseIdField);
				},
				dependents: [
					'refresh-database-select',
					'notion-property-name',
					'notion-property-category',
					'notion-property-course',
					'notion-property-url',
					'notion-property-available',
					'notion-property-due',
					'notion-property-span',
				],
			},
			propertyNames: {
				name: {
					defaultValue: 'Name',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-property-name', 'input', RequiredStringField);
					},
					validateOn: 'change',
				},
				category: {
					defaultValue: 'Category',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-property-category', 'input', StringField);
					},
					dependents: ['notion-category-canvas'],
				},
				course: {
					defaultValue: 'Course',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-property-course', 'input', StringField);
					},
				},
				url: {
					defaultValue: 'URL',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-property-url', 'input', StringField);
					},
				},
				available: {
					defaultValue: 'Reminder',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-property-available', 'input', StringField);
					},
				},
				due: {
					defaultValue: 'Due',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-property-due', 'input', StringField);
					},
				},
				span: {
					defaultValue: 'Date Span',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-property-span', 'input', StringField);
					},
				},
			},
			propertyValues: {
				categoryCanvas: {
					defaultValue: 'Canvas',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>('notion-category-canvas', 'input', StringField);
					},
				},
			},
			courseEmojis: {
				defaultValue: '{}',
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = KeyValueGroup.getInstance<InputElementId>('course-emojis-group', 'course-emojis-codes', 'course-emojis-emojis');
				},
			},
		},
	},
};