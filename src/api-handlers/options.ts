import browser from 'webextension-polyfill';

import { SavedFields, IOptions } from '../options';
import { CONFIGURATION } from '../options/configuration';

export const Options = {
	async getSavedFields(): Promise<SavedFields> {
		const fieldsWithDefaultValues = Object.fromEntries(
			Object.entries(CONFIGURATION.FIELDS).map(([field, { defaultValue }]) => [field, defaultValue]),
		);

		return await <Promise<SavedFields>>browser.storage.local.get(fieldsWithDefaultValues);
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
				notionKey: savedFields['notion.notionKey'],
				databaseId: savedFields['notion.databaseId'],
				propertyNames: {
					name: savedFields['notion.propertyNames.name'],
					category: savedFields['notion.propertyNames.category'],
					course: savedFields['notion.propertyNames.course'],
					url: savedFields['notion.propertyNames.url'],
					status: savedFields['notion.propertyNames.status'],
					available: savedFields['notion.propertyNames.available'],
					due: savedFields['notion.propertyNames.due'],
					span: savedFields['notion.propertyNames.span'],
				},
				propertyValues: {
					categoryCanvas: savedFields['notion.propertyValues.categoryCanvas'],
					statusToDo: savedFields['notion.propertyValues.statusToDo'],
				},
				courseEmojis: JSON.parse(savedFields['notion.courseEmojis']),
			},
		};
	},
};