import { EmojiRequest, TimeZoneRequest } from './notion';

import { ModifyDeep } from './utils';

export type NeverEmpty<T extends string> = T extends '' ? never : T;
export type NullIfEmpty<T extends string | null> = (T extends '' ? null : T) | null;

interface RequiredFields {
	// ! null is retained to avoid breaking changes, see #68
	'extension.displayTheme': null | 'system' | 'light' | 'dark';
	'popup.displayJSONButton': boolean;
	'options.displayAdvanced': boolean;
	'canvas.importMissingDueDates': boolean;
	'notion.accessToken': NullIfEmpty<string>;
	'notion.databaseId': NullIfEmpty<string>;
	'notion.propertyNames.name': NeverEmpty<string>;
	'notion.importPastDueDates': boolean;
	'notion.importChanges.name': boolean;
	'notion.importChanges.points': boolean;
	'notion.importChanges.available': boolean;
	'notion.importChanges.due': boolean;
	'notion.importChanges.span': boolean;
	'background.syncEnabled': boolean;
	'background.syncInterval': number;
}

interface OptionalFields {
	'timeZone': NullIfEmpty<NonNullable<TimeZoneRequest>>;
	'canvas.courseCodeOverrides': NeverEmpty<string>;
	'notion.propertyNames.category': NullIfEmpty<string>;
	'notion.propertyNames.course': NullIfEmpty<string>;
	'notion.propertyNames.url': NullIfEmpty<string>;
	'notion.propertyNames.points': NullIfEmpty<string>;
	'notion.propertyNames.available': NullIfEmpty<string>;
	'notion.propertyNames.due': NullIfEmpty<string>;
	'notion.propertyNames.span': NullIfEmpty<string>;
	'notion.propertyValues.categoryCanvas': NullIfEmpty<string>;
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
	extension: {
		displayTheme: RequiredFields['extension.displayTheme'];
	};
	popup: {
		displayJSONButton: RequiredFields['popup.displayJSONButton'];
	};
	options: {
		displayAdvanced: RequiredFields['options.displayAdvanced'];
	};
	canvas: {
		importMissingDueDates: RequiredFields['canvas.importMissingDueDates'];
		courseCodeOverrides: OptionalFields['canvas.courseCodeOverrides'];
	},
	notion: {
		accessToken: RequiredFields['notion.accessToken'];
		databaseId: RequiredFields['notion.databaseId'];
		propertyNames: {
			name: RequiredFields['notion.propertyNames.name'];
			category: OptionalFields['notion.propertyNames.category'];
			course: OptionalFields['notion.propertyNames.course'];
			url: OptionalFields['notion.propertyNames.url'];
			points: OptionalFields['notion.propertyNames.points'];
			available: OptionalFields['notion.propertyNames.available'];
			due: OptionalFields['notion.propertyNames.due'];
			span: OptionalFields['notion.propertyNames.span'];
		},
		propertyValues: {
			categoryCanvas: OptionalFields['notion.propertyValues.categoryCanvas'];
		},
		importPastDueDates: RequiredFields['notion.importPastDueDates'];
		importChanges: {
			name: RequiredFields['notion.importChanges.name'];
			points: RequiredFields['notion.importChanges.points'];
			available: RequiredFields['notion.importChanges.available'];
			due: RequiredFields['notion.importChanges.due'];
			span: RequiredFields['notion.importChanges.span'];
		},
		courseEmojis: OptionalFields['notion.courseEmojis'];
	};
	background: {
		syncEnabled: RequiredFields['background.syncEnabled'];
		syncInterval: RequiredFields['background.syncInterval'];
	};
};

/**
 * A type alias for the configurable extension options, after any type conversions from local storage.
 */
export type IOptions = ModifyDeep<SavedOptions, {
	canvas: {
		timeZone: OptionalFields['timeZone'];
		courseCodeOverrides: Record<string, string>;
	};
	notion: {
		timeZone: OptionalFields['timeZone'];
		courseEmojis: Record<string, EmojiRequest>;
	};
	background: SavedOptions['background'];
}>;

// undefined if not set yet
export interface NotionFields {
	'notion.accessToken'?: string;
	'notion.botId'?: string;
	'notion.workspace.id'?: string;
	'notion.workspace.name'?: string | null;
	'notion.workspace.icon'?: string | null;
	'notion.owner.workspace'?: true | null;
	'notion.owner.type'?: 'user' | null;
	'notion.owner.user.object'?: 'user' | null;
	'notion.owner.user.id'?: string | null;
	'notion.owner.user.type'?: string | null;
	'notion.owner.user.name'?: string | null;
	'notion.owner.user.avatarURL'?: string | null;
}

export interface NotionAuthorisation {
	accessToken?: string;
	botId?: string;
	workspace: {
		id?: string;
		name?: string | null;
		icon?: string | null;
	};
	owner: {
		workspace?: true | null;
		type?: 'user' | null;
		user: {
			object?: 'user' | null;
			id?: string | null;
			type?: string | null;
			name?: string | null;
			avatarURL?: string | null;
		};
	};
}
