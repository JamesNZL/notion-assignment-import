import { Input, KeyValueGroup, SegmentedControl } from '../elements';

import {
	InputFieldValidator,
	StringField,
	RequiredStringField,
	TimeZoneField,
	RequiredNotionTokenField,
	RequiredNotionDatabaseIdField,
} from './validator';

import { NullIfEmpty, SavedFields, SavedOptions } from '../types/storage';
import { valueof } from '../types/utils';

export type SupportedTypes = NullIfEmpty<string> | boolean | number;

interface Readable {
	validate(force?: boolean): Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT>;
	getValue(): SupportedTypes;
}

interface Settable {
	setValue(value: SupportedTypes, dispatchEvent?: boolean): void;
	markModified(comparand: SupportedTypes): boolean;
}

interface Displayable {
	isSelfHidden: boolean;
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

interface HasLabels {
	getLabels(): globalThis.Element[];
}

interface HasPlaceholder {
	setPlaceholder(placeholder: unknown): void;
}

export interface OptionConfiguration<T> {
	readonly defaultValue: T;
	input: Readable & Settable & Displayable & Dependable & Subscribable & HasLabels & Partial<HasPlaceholder>;
	// default to 'input' if undefined
	readonly validateOn?: 'input' | 'change';
	readonly dependents?: readonly InputElementId[];
}

function isOptionConfiguration(object: valueof<NestedConfigurationsOf<SavedOptions>> | OptionConfiguration<SupportedTypes>): object is OptionConfiguration<SupportedTypes> {
	const configurationProperties: (keyof OptionConfiguration<SupportedTypes>)[] = ['defaultValue', 'input'];
	return configurationProperties.every(key => Object.keys(object).includes(key));
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
	'canvas.importMissingDueDates': 'missing-due-dates';
	ignoreMissingDueDates: 'ignore-missing-due-dates';
	importMissingDueDates: 'import-missing-due-dates';
	'canvas.courseCodeOverrides': 'course-code-overrides-group';
	'notion.accessToken': 'notion-token';
	'notion.databaseId': 'database-id';
	refreshDatabaseSelect: 'refresh-database-select';
	'notion.propertyNames.name': 'notion-property-name';
	'notion.propertyNames.category': 'notion-property-category';
	'notion.propertyNames.course': 'notion-property-course';
	'notion.propertyNames.url': 'notion-property-url';
	'notion.propertyNames.points': 'notion-property-points';
	'notion.propertyNames.available': 'notion-property-available';
	'notion.propertyNames.due': 'notion-property-due';
	'notion.propertyNames.span': 'notion-property-span';
	'notion.propertyValues.categoryCanvas': 'notion-category-canvas';
	'notion.importPastDueDates': 'past-due-dates';
	ignorePastDueDates: 'ignore-past-due-dates';
	importPastDueDates: 'import-past-due-dates';
	'notion.importChanges.name': 'notion-changes-name';
	noChangesName: 'no-changes-name-button';
	yesChangesName: 'yes-changes-name-button';
	'notion.importChanges.points': 'notion-changes-points';
	noChangesPoints: 'no-changes-points-button';
	yesChangesPoints: 'yes-changes-points-button';
	'notion.importChanges.available': 'notion-changes-available';
	noChangesAvailable: 'no-changes-available-button';
	yesChangesAvailable: 'yes-changes-available-button';
	'notion.importChanges.due': 'notion-changes-due';
	noChangesDue: 'no-changes-due-button';
	yesChangesDue: 'yes-changes-due-button';
	'notion.importChanges.span': 'notion-changes-span';
	noChangesSpan: 'no-changes-span-button';
	yesChangesSpan: 'yes-changes-span-button';
	'background.syncEnabled': 'background-sync-enabled';
	backgroundSyncDisabled: 'background-sync-disabled';
	backgroundSyncEnabled: 'background-sync-enabled-button';
	'background.syncInterval': 'background-sync-interval';
	'notion.courseEmojis': 'course-emojis-group';
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
					return flattenOptions<typeof nestedKeyPath>([nestedKeyPath, <valueof<typeof CONFIGURATION['OPTIONS']>>nestedValueObject]);
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
				return this.input = Input.getInstance<InputElementId>({
					id: 'timezone',
					Validator: TimeZoneField,
				});
			},
		},
		extension: {
			displayTheme: {
				defaultValue: 'system',
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
						id: 'display-theme',
						segments: [
							{
								id: 'display-system-mode',
								value: 'system',
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
						],
					});
				},
			},
		},
		popup: {
			displayJSONButton: {
				defaultValue: false,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
						id: 'display-json-button',
						segments: [
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
						],
					});
				},
			},
		},
		options: {
			displayAdvanced: {
				defaultValue: false,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
						id: 'display-advanced-options',
						segments: [
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
						],
					});
				},
			},
		},
		canvas: {
			importMissingDueDates: {
				defaultValue: false,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
						id: 'missing-due-dates',
						segments: [
							{
								id: 'ignore-missing-due-dates',
								value: false,
								default: true,
							},
							{
								id: 'import-missing-due-dates',
								value: true,
								showDependents: true,
							},
						],
					});
				},
			},
			courseCodeOverrides: {
				defaultValue: '{}',
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = KeyValueGroup.getInstance<InputElementId>({
						id: 'course-code-overrides-group',
					});
				},
			},
		},
		notion: {
			accessToken: {
				defaultValue: null,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = Input.getInstance<InputElementId>({
						id: 'notion-token',
						Validator: RequiredNotionTokenField,
					});
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
					return this.input = Input.getInstance<InputElementId>({
						id: 'database-id',
						Validator: RequiredNotionDatabaseIdField,
					});
				},
				dependents: [
					'notion-property-name',
					'notion-property-category',
					'notion-property-course',
					'notion-property-url',
					'notion-property-points',
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
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-name',
							Validator: RequiredStringField,
						});
					},
					validateOn: 'change',
					dependents: ['notion-changes-name'],
				},
				category: {
					defaultValue: 'Category',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-category',
							Validator: StringField,
						});
					},
					dependents: ['notion-category-canvas'],
				},
				course: {
					defaultValue: 'Course',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-course',
							Validator: StringField,
						});
					},
				},
				url: {
					defaultValue: 'URL',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-url',
							Validator: StringField,
						});
					},
				},
				points: {
					defaultValue: 'Points',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-points',
							Validator: StringField,
						});
					},
					dependents: ['notion-changes-points'],
				},
				available: {
					defaultValue: 'Reminder',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-available',
							Validator: StringField,
						});
					},
					dependents: ['notion-changes-available'],
				},
				due: {
					defaultValue: 'Due',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-due',
							Validator: StringField,
						});
					},
					dependents: ['notion-changes-due'],
				},
				span: {
					defaultValue: 'Date Span',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-property-span',
							Validator: StringField,
						});
					},
					dependents: ['notion-changes-span'],
				},
			},
			propertyValues: {
				categoryCanvas: {
					defaultValue: 'Canvas',
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = Input.getInstance<InputElementId>({
							id: 'notion-category-canvas',
							Validator: StringField,
						});
					},
				},
			},
			importPastDueDates: {
				defaultValue: false,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
						id: 'past-due-dates',
						segments: [
							{
								id: 'ignore-past-due-dates',
								value: false,
								default: true,
							},
							{
								id: 'import-past-due-dates',
								value: true,
								showDependents: true,
							},
						],
					});
				},
			},
			importChanges: {
				'name': {
					defaultValue: true,
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
							id: 'notion-changes-name',
							segments: [
								{
									id: 'no-changes-name-button',
									value: false,
								},
								{
									id: 'yes-changes-name-button',
									value: true,
									default: true,
									showDependents: true,
								},
							],
						});
					},
				},
				'points': {
					defaultValue: true,
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
							id: 'notion-changes-points',
							segments: [
								{
									id: 'no-changes-points-button',
									value: false,
								},
								{
									id: 'yes-changes-points-button',
									value: true,
									default: true,
									showDependents: true,
								},
							],
						});
					},
				},
				'available': {
					defaultValue: true,
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
							id: 'notion-changes-available',
							segments: [
								{
									id: 'no-changes-available-button',
									value: false,
								},
								{
									id: 'yes-changes-available-button',
									value: true,
									default: true,
									showDependents: true,
								},
							],
						});
					},
				},
				'due': {
					defaultValue: true,
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
							id: 'notion-changes-due',
							segments: [
								{
									id: 'no-changes-due-button',
									value: false,
								},
								{
									id: 'yes-changes-due-button',
									value: true,
									default: true,
									showDependents: true,
								},
							],
						});
					},
				},
				'span': {
					defaultValue: true,
					get input() {
						delete (<Partial<typeof this>>this).input;
						return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
							id: 'notion-changes-span',
							segments: [
								{
									id: 'no-changes-span-button',
									value: false,
								},
								{
									id: 'yes-changes-span-button',
									value: true,
									default: true,
									showDependents: true,
								},
							],
						});
					},
				},
			},
			courseEmojis: {
				defaultValue: '{}',
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = KeyValueGroup.getInstance<InputElementId>({
						id: 'course-emojis-group',
					});
				},
			},
		},
		background: {
			syncEnabled: {
				defaultValue: false,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = SegmentedControl.getInstance<InputElementId, typeof this.defaultValue>({
						id: 'background-sync-enabled',
						segments: [
							{
								id: 'background-sync-disabled',
								value: false,
								default: true,
							},
							{
								id: 'background-sync-enabled-button',
								value: true,
								showDependents: true,
							},
						],
					});
				},
				dependents: ['background-sync-interval'],
			},
			syncInterval: {
				defaultValue: 60,
				get input() {
					delete (<Partial<typeof this>>this).input;
					return this.input = Input.getInstance<InputElementId>({
						id: 'background-sync-interval',
						Validator: RequiredStringField, // Simplified for now, should ideally be numeric validator
					});
				},
			},
		},
	},
};