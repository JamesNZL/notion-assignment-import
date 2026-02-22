import browser from 'webextension-polyfill';

import { CONFIGURATION, SupportedTypes } from '../options/configuration';

import { SavedAssignments } from '../popup/fetch';

import { NotionFields, NotionAuthorisation, SavedFields, IOptions } from '../types/storage';

const KEYS = <const>{
	course: 'savedCourse',
	assignments: 'savedAssignments',
	oauthState: 'oauthState',
	lastVersion: 'lastVersion',
};

export const Storage = <const>{
	async getLastVersion(): Promise<string> {
		return (await browser.storage.local.get(KEYS.lastVersion))[KEYS.lastVersion];
	},

	async setLastVersion(version: string) {
		return await browser.storage.local.set({ [KEYS.lastVersion]: version });
	},

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

	async getStorageKey<K extends keyof SavedFields>(key: K, defaultValue: SavedFields[K]) {
		return (await browser.storage.local.get({ [key]: defaultValue }))[key];
	},

	async clearStorageKey(key: keyof SavedFields) {
		return await browser.storage.local.remove(key);
	},

	async setSavedFields(fields: Record<keyof SavedFields, SupportedTypes>) {
		return await browser.storage.local.set(fields);
	},

	async getOptions(): Promise<IOptions> {
		const savedFields = await this.getSavedFields();

		return {
			timeZone: savedFields['timeZone'],
			extension: {
				displayTheme: savedFields['extension.displayTheme'],
			},
			popup: {
				displayJSONButton: savedFields['popup.displayJSONButton'],
			},
			options: {
				displayAdvanced: savedFields['options.displayAdvanced'],
			},
			canvas: {
				timeZone: savedFields['timeZone'],
				importMissingDueDates: savedFields['canvas.importMissingDueDates'],
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
					points: savedFields['notion.propertyNames.points'],
					available: savedFields['notion.propertyNames.available'],
					due: savedFields['notion.propertyNames.due'],
					span: savedFields['notion.propertyNames.span'],
				},
				propertyValues: {
					categoryCanvas: savedFields['notion.propertyValues.categoryCanvas'],
				},
				importPastDueDates: savedFields['notion.importPastDueDates'],
				importChanges: {
					name: savedFields['notion.importChanges.name'],
					points: savedFields['notion.importChanges.points'],
					available: savedFields['notion.importChanges.available'],
					due: savedFields['notion.importChanges.due'],
					span: savedFields['notion.importChanges.span'],
				},
				courseEmojis: JSON.parse(savedFields['notion.courseEmojis']),
			},
			background: {
				syncEnabled: savedFields['background.syncEnabled'],
				syncInterval: Number(savedFields['background.syncInterval']),
			},
		};
	},
};