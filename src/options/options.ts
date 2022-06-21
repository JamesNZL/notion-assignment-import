import { Storage } from '../apis/storage';

import { SavedFields } from './';
import { InputFieldValidator } from './validator';
import { CONFIGURATION, SupportedTypes } from './configuration';

import { Button, Input, getElementById } from '../elements';

import { valueof } from '../types/utils';

// if an id ever changes in HTML, it must be updated here
// static type checking will then be available through ElementId
interface OptionsElements {
	restore: {
		timeZone: 'options-restore-timezone';
		canvasClassNames: 'options-restore-canvas-class-names';
		canvasClassValues: 'options-restore-canvas-class-values';
		canvasCourseCodes: 'options-restore-canvas-course-codes';
		notionPropertyNames: 'options-restore-notion-property-names';
		notionPropertyValues: 'options-restore-notion-property-values';
		notionEmojis: 'options-restore-notion-emojis';
		all: 'options-restore-all';
	};
	buttons: {
		undo: 'options-undo-all';
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
		this.removeClass('red-hover');
		this.setLabel('Restored!');
		this.resetHTML(1325);

		this.restoreDefaults();
		this.validateInputs();

		if (this.restoreKeys.includes('options.displayAdvanced')) {
			AdvancedOptions.dispatchInputEvents();
		}
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
		const savedFields = await Storage.getSavedFields();

		Object.entries(savedFields).forEach(([field, value]) => {
			const fieldElementId = CONFIGURATION.FIELDS[<keyof typeof savedFields>field].elementId;
			Input.getInstance(fieldElementId).setValue(value);
		});
	},

	async saveOptions() {
		const fieldEntries = await OptionsPage.getInputs();

		if (fieldEntries) {
			Storage.setSavedFields(fieldEntries);

			buttons.save.setLabel('Saved!');
			buttons.save.resetHTML(1325);

			this.restoreOptions();
		}
	},

	async getInputs(): Promise<Record<keyof SavedFields, SupportedTypes> | null> {
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

		if (Object.values(fieldEntries).every(value => value !== InputFieldValidator.INVALID_INPUT)) return <Record<keyof SavedFields, SupportedTypes>>fieldEntries;

		return null;
	},
};

const AdvancedOptions = {
	element: getElementById<OptionsElementId>('advanced-options'),
	control: getElementById(CONFIGURATION.FIELDS['options.displayAdvanced'].elementId),

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

	dispatchInputEvents() {
		if (!this.control) return;
		this.control.parentElement?.childNodes.forEach(input => input.dispatchEvent(new Event('input', { bubbles: true })));
	},
};

const buttons: {
	[K in OptionsButtonName]: Button;
} & {
	restore: {
		[K in OptionsRestoreButtonName]: RestoreButton;
	};
} = {
	undo: Button.getInstance<OptionsButtonId>('options-undo-all'),
	save: Button.getInstance<OptionsButtonId>('save-button'),
	restore: {
		timeZone: RestoreButton.getInstance<OptionsRestoreButtonId>('options-restore-timezone',
			[
				'timeZone',
			],
		),
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
Storage.getOptions().then(({ options: { displayAdvanced } }) => AdvancedOptions.toggle(displayAdvanced));

// add event listener to advanced options toggle
AdvancedOptions.control?.parentElement?.addEventListener('input', () => AdvancedOptions.toggle((<HTMLInputElement>AdvancedOptions.control)?.checked ?? false));

// validate fields on input
Object.values(CONFIGURATION.FIELDS)
	.forEach(({ elementId, Validator, validateOn = 'input', dependents = [] }) => {
		const input = Input.getInstance(elementId);

		if (Validator) {
			input.addEventListener(validateOn, async () => {
				const inputValue = await OptionsPage.validateInput(elementId, Validator);

				if (!dependents.length) return;

				if (inputValue === null) {
					return dependents.forEach(dependentId => Input.getInstance(dependentId).hide());
				}

				dependents.forEach(dependentId => Input.getInstance(dependentId).show());
			});
		}
	});

Object.values(buttons.restore).forEach(button => button.addEventListener('click', button.clickHandler.bind(button)));

buttons.undo.addEventListener('click', () => {
	OptionsPage.restoreOptions();
	AdvancedOptions.dispatchInputEvents();

	buttons.undo.removeClass('red-hover');
	buttons.undo.setLabel('Restored!');
	buttons.undo.resetHTML(1325);
});

buttons.save.addEventListener('click', OptionsPage.saveOptions);

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		OptionsPage.saveOptions();
	}
});

const Konami = {
	pattern: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
	currentIndex: 0,

	handler(event: KeyboardEvent) {
		if (this.pattern.indexOf(event.key) < 0 || event.key !== this.pattern[this.currentIndex]) {
			return this.currentIndex = 0;
		}

		this.currentIndex++;

		if (this.currentIndex === this.pattern.length && AdvancedOptions.control) {
			this.currentIndex = 0;
			(<HTMLInputElement>AdvancedOptions.control).checked = true;
			AdvancedOptions.control?.parentElement?.dispatchEvent(new Event('input', { bubbles: true }));
		}
	},
};

document.addEventListener('keydown', event => Konami.handler(event), false);