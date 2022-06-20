import browser from 'webextension-polyfill';

import { Fields, Options } from '../api-handlers/options';

import { CONFIGURATION } from './configuration';

import { Input } from '../elements';

const OptionsPage = {
	async restoreOptions() {
		const savedFields = await Fields.getSavedFields();

		Object.entries(savedFields).forEach(([field, value]) => {
			const fieldElementId = CONFIGURATION.FIELDS[<keyof typeof savedFields>field].elementId;
			new Input(fieldElementId).setValue(value);
		});
	},

	async saveOptions() {
		const fieldEntries = await Fields.getInputs();

		if (fieldEntries) {
			await browser.storage.local.set(fieldEntries);

			if (saveButton) {
				saveButton.innerHTML = 'Saved!';

				setTimeout(() => {
					saveButton.innerHTML = 'Validate and Save';
				}, 1325);
			}

			this.restoreOptions();
		}
	},
};

document.addEventListener('DOMContentLoaded', OptionsPage.restoreOptions);

// show advanced options if appropriate
const advancedOptions = document.getElementById('advanced-options');
const advancedOptionsControl = document.getElementById(CONFIGURATION.FIELDS['options.displayAdvanced'].elementId);

function toggleAdvancedOptions(displayAdvanced: boolean) {
	if (!advancedOptions) return;
	(displayAdvanced)
		? advancedOptions.classList.remove('hidden')
		: advancedOptions.classList.add('hidden');
}

Options.getOptions().then(({ options: { displayAdvanced } }) => toggleAdvancedOptions(displayAdvanced));

// add event listener to advanced options toggle
advancedOptionsControl?.parentElement?.addEventListener('input', () => toggleAdvancedOptions((<HTMLInputElement>advancedOptionsControl)?.checked ?? false));

// validate fields on input
Object.values(CONFIGURATION.FIELDS).forEach(({ elementId, Validator, validateOn = 'input' }) => {
	if (Validator) document.getElementById(elementId)?.addEventListener(validateOn, () => Fields.validateInput(elementId, Validator));
});

// TODO: import Button class
const saveButton = document.getElementById('save-button');
saveButton?.addEventListener('click', OptionsPage.saveOptions);

document.addEventListener('keydown', keyEvent => {
	if (keyEvent.ctrlKey && keyEvent.key === 's') {
		keyEvent.preventDefault();
		OptionsPage.saveOptions();
	}
});