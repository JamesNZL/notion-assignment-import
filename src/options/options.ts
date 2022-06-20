import browser from 'webextension-polyfill';

import { Options } from '../api-handlers/options';

import { NullIfEmpty, SavedFields } from './';
import { InputFieldValidator } from './validator';
import { CONFIGURATION, SupportedTypes } from './configuration';

import { Button, Input, getElementById } from '../elements';

import { valueof } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface OptionsElements {
	restore: {
		canvasClassNames: 'options-restore-canvas-class-names';
		canvasClassValues: 'options-restore-canvas-class-values';
		canvasCourseCodes: 'options-restore-canvas-course-codes';
		notionIntegration: 'options-restore-notion-integration';
		notionPropertyNames: 'options-restore-notion-property-names';
		notionPropertyValues: 'options-restore-notion-property-values';
		notionEmojis: 'options-restore-notion-emojis';
		all: 'options-restore-all';
	};
	buttons: {
		save: 'save-button';
	};
	elements: {
		advancedOptions: 'advanced-options';
	};
}

type OptionsRestoreButtonName = keyof OptionsElements['restore'];
type OptionsRestoreButtonId = valueof<OptionsElements['restore']>;
type OptionsButtonName = keyof OptionsElements['buttons'];
type OptionsButtonId = valueof<OptionsElements['buttons']>;
type OptionsElementId = OptionsRestoreButtonId | OptionsButtonId | valueof<OptionsElements['elements']>;

class RestoreButton extends Button {
	protected static override instances: Record<string, RestoreButton> = {};

	private restoreKeys: (keyof SavedFields)[];
	private inputs: Partial<Record<keyof SavedFields, Input>>;
	private capturedValues: Partial<Record<keyof SavedFields, SupportedTypes>>;

	protected constructor(id: string, restoreKeys: (keyof SavedFields)[]) {
		super(id);

		this.restoreKeys = restoreKeys;
		this.inputs = Object.fromEntries(
			this.restoreKeys.map(key => [key, Input.getInstance(CONFIGURATION.FIELDS[key].elementId)]),
		);
		this.capturedValues = this.captureValues();
	}

	public static override getInstance<T extends string>(id: T, restoreKeys?: (keyof SavedFields)[]): RestoreButton {
		if (!restoreKeys) throw new Error('Argument restoreKeys must be defined for class RestoreButton!');
		return RestoreButton.instances[id] = RestoreButton.instances[id] ?? new RestoreButton(id, restoreKeys);
	}

	private captureValues(): Partial<Record<keyof SavedFields, SupportedTypes>> {
		return Object.fromEntries(
			Object.entries(this.inputs).map(([key, input]) => [key, input.getValue()]),
		);
	}

	private restoreCaptured() {
		Object.entries(this.inputs).forEach(([key, input]) => {
			const configuredValue = this.capturedValues[<keyof SavedFields>key];
			if (configuredValue !== undefined) input.setValue(configuredValue);
		});
	}

	private restoreDefaults() {
		this.capturedValues = this.captureValues();

		Object.entries(this.inputs).forEach(([key, input]) => {
			const { defaultValue } = CONFIGURATION.FIELDS[<keyof SavedFields>key];
			input.setValue(defaultValue);
		});
	}

	private validateInputs() {
		Object.entries(this.inputs).forEach(([key]) => {
			const { elementId, Validator } = CONFIGURATION.FIELDS[<keyof SavedFields>key];
			if (Validator) OptionsPage.validateInput(elementId, Validator);
		});
	}

	public clickHandler() {
		const verifyPrompt = 'Confirm';
		const verifyPeriod = 3000;

		if (this.getLabel() !== verifyPrompt) {
			this.addClass('red');
			this.removeClass('red-hover');

			this.setLabel(verifyPrompt);

			this.restoreDefaults();
			this.validateInputs();

			this.setTimeout('restore', () => {
				this.restoreCaptured();
				this.validateInputs();

				this.resetHTML();
			}, verifyPeriod);

			return;
		}

		this.clearTimeout('restore');

		if (this.restoreKeys.includes('options.displayAdvanced')) {
			this.inputs['options.displayAdvanced']?.dispatchInputEvent();
		}

		this.addClass('green');
		this.removeClass('red');
		this.setLabel('Restored!');
		this.resetHTML(3500);
	}
}

const OptionsPage = {
	async validateInput(elementId: string, Validator: InputFieldValidator) {
		const inputValue = Input.getInstance(elementId).getValue() ?? null;

		// boolean values are always valid
		if (typeof inputValue === 'boolean') return inputValue;

		return await Validator.validate(inputValue);
	},

	async restoreOptions() {
		const savedFields = await Options.getSavedFields();

		Object.entries(savedFields).forEach(([field, value]) => {
			const fieldElementId = CONFIGURATION.FIELDS[<keyof typeof savedFields>field].elementId;
			Input.getInstance(fieldElementId).setValue(value);
		});
	},

	async saveOptions() {
		const fieldEntries = await OptionsPage.getInputs();

		if (fieldEntries) {
			await browser.storage.local.set(fieldEntries);

			buttons.save.setLabel('Saved!');
			buttons.save.resetHTML(1325);

			this.restoreOptions();
		}
	},

	async getInputs(): Promise<Record<keyof SavedFields, NullIfEmpty<string>> | null> {
		const fieldEntries = Object.fromEntries(
			await Promise.all(
				Object.entries(CONFIGURATION.FIELDS).map(async ([field, { elementId, Validator }]) => {
					const validatedInput = (Validator)
						? await this.validateInput(elementId, Validator)
						: Input.getInstance(elementId).getValue();
					return [field, validatedInput];
				}),
			),
		);

		if (Object.values(fieldEntries).every(value => value !== InputFieldValidator.INVALID_INPUT)) return <Record<keyof SavedFields, NullIfEmpty<string>>>fieldEntries;

		return null;
	},
};

const AdvancedOptions = {
	element: getElementById<OptionsElementId>('advanced-options'),

	show() {
		this.element?.classList.remove('hidden');
	},

	hide() {
		this.element?.classList.add('hidden');
	},

	toggle(display: boolean) {
		(display)
			? this.show()
			: this.hide();
	},
};

const buttons: {
	[K in OptionsButtonName]: Button;
} & {
	restore: {
		[K in OptionsRestoreButtonName]: RestoreButton;
	};
} = {
	save: Button.getInstance<OptionsButtonId>('save-button'),
	restore: {
		canvasClassNames: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-canvas-class-names',
			[
				'canvas.classNames.breadcrumbs',
				'canvas.classNames.assignment',
				'canvas.classNames.title',
				'canvas.classNames.availableDate',
				'canvas.classNames.availableStatus',
				'canvas.classNames.dueDate',
				'canvas.classNames.dateElement',
			],
		),
		canvasClassValues: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-canvas-class-values',
			[
				'canvas.classValues.courseCodeN',
				'canvas.classValues.notAvailable',
			],
		),
		canvasCourseCodes: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-canvas-course-codes',
			[
				'canvas.courseCodeOverrides',
			],
		),
		notionIntegration: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-notion-integration',
			[
				'notion.notionKey',
				'notion.databaseId',
				'timeZone',
			],
		),
		notionPropertyNames: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-notion-property-names',
			[
				'notion.propertyNames.name',
				'notion.propertyNames.category',
				'notion.propertyNames.course',
				'notion.propertyNames.url',
				'notion.propertyNames.status',
				'notion.propertyNames.available',
				'notion.propertyNames.due',
				'notion.propertyNames.span',
			],
		),
		notionPropertyValues: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-notion-property-values',
			[
				'notion.propertyValues.categoryCanvas',
				'notion.propertyValues.statusToDo',
			],
		),
		notionEmojis: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-notion-emojis',
			[
				'notion.courseEmojis',
			],
		),
		all: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-all',
			<(keyof SavedFields)[]>Object.keys(CONFIGURATION.FIELDS),
		),
	},
};

document.addEventListener('DOMContentLoaded', OptionsPage.restoreOptions);

// show advanced options if appropriate
Options.getOptions().then(({ options: { displayAdvanced } }) => AdvancedOptions.toggle(displayAdvanced));

// add event listener to advanced options toggle
const advancedOptionsControl = document.getElementById(CONFIGURATION.FIELDS['options.displayAdvanced'].elementId);
advancedOptionsControl?.parentElement?.addEventListener('input', () => AdvancedOptions.toggle((<HTMLInputElement>advancedOptionsControl)?.checked ?? false));

// validate fields on input
Object.values(CONFIGURATION.FIELDS).forEach(({ elementId, Validator, validateOn = 'input' }) => {
	if (Validator) document.getElementById(elementId)?.addEventListener(validateOn, () => OptionsPage.validateInput(elementId, Validator));
});

Object.values(buttons.restore).forEach(button => button.addEventListener('click', () => button.clickHandler()));

buttons.save.addEventListener('click', OptionsPage.saveOptions);

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		OptionsPage.saveOptions();
	}
});