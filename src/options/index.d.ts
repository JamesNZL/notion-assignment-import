import { EmojiRequest, TimeZoneRequest } from '../apis/notion';

import { ModifyDeep } from '../types/utils';

type NeverEmpty<T extends string> = T extends '' ? never : T;
type NullIfEmpty<T extends string | null> = (T extends '' ? null : T) | null;

interface RequiredFields {
	'popup.displayJSONButton': boolean;
	'options.displayAdvanced': boolean;
	'canvas.classNames.breadcrumbs': NeverEmpty<string>;
	'canvas.classNames.assignment': NeverEmpty<string>;
	'canvas.classNames.title': NeverEmpty<string>;
	'canvas.classNames.availableDate': NeverEmpty<string>;
	'canvas.classNames.availableStatus': NeverEmpty<string>;
	'canvas.classNames.dueDate': NeverEmpty<string>;
	'canvas.classNames.dateElement': NeverEmpty<string>;
	'canvas.classValues.courseCodeN': NeverEmpty<string>,
	'canvas.classValues.notAvailable': NeverEmpty<string>;
	// initialised to null, but can never be cleared once set
	'notion.notionKey': NullIfEmpty<string>;
	'notion.databaseId': NullIfEmpty<string>;
	'notion.propertyNames.name': NeverEmpty<string>;
}

interface OptionalFields {
	'timeZone': NullIfEmpty<NonNullable<TimeZoneRequest>>;
	'canvas.courseCodeOverrides': NeverEmpty<string>;
	'notion.propertyNames.category': NullIfEmpty<string>;
	'notion.propertyNames.course': NullIfEmpty<string>;
	'notion.propertyNames.url': NullIfEmpty<string>;
	'notion.propertyNames.status': NullIfEmpty<string>;
	'notion.propertyNames.available': NullIfEmpty<string>;
	'notion.propertyNames.due': NullIfEmpty<string>;
	'notion.propertyNames.span': NullIfEmpty<string>;
	'notion.propertyValues.categoryCanvas': NullIfEmpty<string>;
	'notion.propertyValues.statusToDo': NullIfEmpty<string>;
	'notion.courseEmojis': NeverEmpty<string>;
}

/**
 * A type alias for the fields as they are saved in local storage.
 * Keys are a stringified representation of their 'path' within the `Options` type.
 */
export type SavedFields = RequiredFields & OptionalFields;

/**
 * A type alias for the `Options` object as its properties are saved in local storage.
 */
export type SavedOptions = {
	timeZone: OptionalFields['timeZone'];
	popup: {
		displayJSONButton: RequiredFields['popup.displayJSONButton'];
	};
	options: {
		displayAdvanced: RequiredFields['options.displayAdvanced'];
	};
	canvas: {
		classNames: {
			breadcrumbs: RequiredFields['canvas.classNames.breadcrumbs'];
			assignment: RequiredFields['canvas.classNames.assignment'];
			title: RequiredFields['canvas.classNames.title'];
			availableDate: RequiredFields['canvas.classNames.availableDate'];
			availableStatus: RequiredFields['canvas.classNames.availableStatus'];
			dueDate: RequiredFields['canvas.classNames.dueDate'];
			dateElement: RequiredFields['canvas.classNames.dateElement'];
		},
		classValues: {
			courseCodeN: RequiredFields['canvas.classValues.courseCodeN'];
			notAvailable: RequiredFields['canvas.classValues.notAvailable'];
		},
		courseCodeOverrides: OptionalFields['canvas.courseCodeOverrides'];
	},
	notion: {
		propertyNames: {
			name: RequiredFields['notion.propertyNames.name'];
			category: OptionalFields['notion.propertyNames.category'];
			course: OptionalFields['notion.propertyNames.course'];
			url: OptionalFields['notion.propertyNames.url'];
			status: OptionalFields['notion.propertyNames.status'];
			available: OptionalFields['notion.propertyNames.available'];
			due: OptionalFields['notion.propertyNames.due'];
			span: OptionalFields['notion.propertyNames.span'];
		},
		propertyValues: {
			categoryCanvas: OptionalFields['notion.propertyValues.categoryCanvas'];
			statusToDo: OptionalFields['notion.propertyValues.statusToDo'];
		},
		courseEmojis: OptionalFields['notion.courseEmojis'];
	},
};

/**
 * A type alias for the configurable extension options, after any type conversions from local storage.
 */
export type IOptions = ModifyDeep<SavedOptions, {
	canvas: {
		timeZone: OptionalFields['timeZone'];
		classValues: {
			courseCodeN: number;
		};
		selectors: {
			courseCode: NeverEmpty<string>;
			availableStatus: NeverEmpty<string>;
			availableDate: NeverEmpty<string>;
			dueDate: NeverEmpty<string>;
		};
		courseCodeOverrides: Record<string, string>;
	};
	notion: {
		timeZone: OptionalFields['timeZone'];
		courseEmojis: Record<string, EmojiRequest>;
	};
}>;