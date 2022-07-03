import browser from 'webextension-polyfill';

import { SavedFields, IOptions } from '../options';
import { CONFIGURATION, SupportedTypes } from '../options/configuration';

import { SavedAssignments } from '../popup/parse';

// undefined if not set yet
interface NotionFields {
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

interface NotionAuthorisation {
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

const KEYS = <const>{
	course: 'savedCourse',
	assignments: 'savedAssignments',
	oauthState: 'oauthState',
};

export const Storage = <const>{
	async getOAuthState(): Promise<string> {
		return (await browser.storage.local.get(KEYS.oauthState))[KEYS.oauthState];
	},

	async setOAuthState(state: string) {
		return await browser.storage.local.set({ [KEYS.oauthState]: state });
	},

	async getNotionFields(): Promise<NotionFields> {
		const fieldKeys: (keyof NotionFields)[] = [
			'notion.accessToken',
			'notion.botId',
			'notion.workspace.id',
			'notion.workspace.name',
			'notion.workspace.icon',
			'notion.owner.workspace',
			'notion.owner.type',
			'notion.owner.user.object',
			'notion.owner.user.id',
			'notion.owner.user.type',
			'notion.owner.user.name',
			'notion.owner.user.avatarURL',
		];

		return await <Promise<NotionFields>>browser.storage.local.get(fieldKeys);
	},

	async setNotionFields(fields: NotionFields) {
		return await browser.storage.local.set(fields);
	},

	async getNotionAuthorisation(): Promise<NotionAuthorisation> {
		const savedFields = await this.getNotionFields();

		return {
			accessToken: savedFields['notion.accessToken'],
			botId: savedFields['notion.botId'],
			workspace: {
				id: savedFields['notion.workspace.id'],
				name: savedFields['notion.workspace.name'],
				icon: savedFields['notion.workspace.icon'],
			},
			owner: {
				workspace: savedFields['notion.owner.workspace'],
				type: savedFields['notion.owner.type'],
				user: {
					object: savedFields['notion.owner.user.object'],
					id: savedFields['notion.owner.user.id'],
					type: savedFields['notion.owner.user.type'],
					name: savedFields['notion.owner.user.name'],
					avatarURL: savedFields['notion.owner.user.avatarURL'],
				},
			},
		};
	},

	async getSavedCourse(): Promise<string> {
		return (await browser.storage.local.get(KEYS.course))[KEYS.course];
	},

	async setSavedCourse(course: string | null) {
		return await browser.storage.local.set({ [KEYS.course]: course });
	},

	async clearSavedCourse() {
		return await browser.storage.local.remove(KEYS.course);
	},

	async getSavedAssignments(): Promise<SavedAssignments> {
		return (await browser.storage.local.get({ [KEYS.assignments]: {} }))[KEYS.assignments];
	},

	async setSavedAssignments(assignments: SavedAssignments) {
		return await browser.storage.local.set({ [KEYS.assignments]: assignments });
	},

	async clearSavedAssignments() {
		return await browser.storage.local.remove(KEYS.assignments);
	},

	async getSavedFields(): Promise<SavedFields> {
		const fieldsWithDefaultValues = Object.fromEntries(
			Object.entries(CONFIGURATION.FIELDS).map(([field, { defaultValue }]) => [field, defaultValue]),
		);

		return await <Promise<SavedFields>>browser.storage.local.get(fieldsWithDefaultValues);
	},

	async clearDatabaseId() {
		const databaseIdKey: keyof SavedFields = 'notion.databaseId';
		return await browser.storage.local.remove(databaseIdKey);
	},

	async getStorageKey(key: string, defaultValue: unknown) {
		return (await browser.storage.local.get({ [key]: defaultValue }))[key];
	},

	async clearStorageKey(key: string) {
		return await browser.storage.local.remove(key);
	},

	async setSavedFields(fields: Record<keyof SavedFields, SupportedTypes>) {
		return await browser.storage.local.set(fields);
	},

	async getOptions(): Promise<IOptions> {
		const savedFields = await this.getSavedFields();

		return {
			timeZone: savedFields['timeZone'],
			popup: {
				displayJSONButton: savedFields['popup.displayJSONButton'],
			},
			options: {
				displayAdvanced: savedFields['options.displayAdvanced'],
			},
			canvas: {
				timeZone: savedFields['timeZone'],
				classNames: {
					breadcrumbs: savedFields['canvas.classNames.breadcrumbs'],
					assignment: savedFields['canvas.classNames.assignment'],
					title: savedFields['canvas.classNames.title'],
					availableDate: savedFields['canvas.classNames.availableDate'],
					availableStatus: savedFields['canvas.classNames.availableStatus'],
					dueDate: savedFields['canvas.classNames.dueDate'],
					dateElement: savedFields['canvas.classNames.dateElement'],
				},
				classValues: {
					courseCodeN: Number(savedFields['canvas.classValues.courseCodeN']),
					notAvailable: savedFields['canvas.classValues.notAvailable'],
				},
				selectors: {
					get courseCode() { return `.${savedFields['canvas.classNames.breadcrumbs']} li:nth-of-type(${savedFields['canvas.classValues.courseCodeN']}) span`; },
					get availableStatus() { return `.${savedFields['canvas.classNames.availableDate']} .${savedFields['canvas.classNames.availableStatus']}`; },
					get availableDate() { return `.${savedFields['canvas.classNames.availableDate']} .${savedFields['canvas.classNames.dateElement']}`; },
					get dueDate() { return `.${savedFields['canvas.classNames.dueDate']} .${savedFields['canvas.classNames.dateElement']}`; },
				},
				courseCodeOverrides: JSON.parse(savedFields['canvas.courseCodeOverrides']),
			},
			notion: {
				timeZone: savedFields['timeZone'],
				accessToken: savedFields['notion.accessToken'],
				databaseId: savedFields['notion.databaseId'],
				propertyNames: {
					name: savedFields['notion.propertyNames.name'],
					category: savedFields['notion.propertyNames.category'],
					course: savedFields['notion.propertyNames.course'],
					url: savedFields['notion.propertyNames.url'],
					available: savedFields['notion.propertyNames.available'],
					due: savedFields['notion.propertyNames.due'],
					span: savedFields['notion.propertyNames.span'],
				},
				propertyValues: {
					categoryCanvas: savedFields['notion.propertyValues.categoryCanvas'],
				},
				courseEmojis: JSON.parse(savedFields['notion.courseEmojis']),
			},
		};
	},
};