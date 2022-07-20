import { Storage } from '../apis/storage';

import { CONFIGURATION, OptionConfiguration, SupportedTypes } from './configuration';

import { Button } from '../elements';

import { SavedFields } from '../types/storage';

export class RestoreDefaultsButton extends Button {
	protected restoreKeys: (keyof SavedFields)[];
	protected inputs: Map<keyof SavedFields, OptionConfiguration<SupportedTypes>['input']>;

	protected constructor({ id, type, restoreKeys }: {
		id: string;
		type: string;
		restoreKeys: (keyof SavedFields)[];
	}) {
		super({ id, type });

		this.restoreKeys = restoreKeys;
		this.inputs = new Map(
			this.restoreKeys.map(key => [key, CONFIGURATION.FIELDS[key].input]),
		);

		[...this.inputs.values()].forEach(input => input.addEventListener('input', this.toggle.bind(this)));
	}

	public static override getInstance<T extends string>({ id, type = 'restore defaults button', restoreKeys }: {
		id: T;
		type?: string;
		restoreKeys: (keyof SavedFields)[];
	}): RestoreDefaultsButton {
		if (!(RestoreDefaultsButton.instances.get(id) instanceof RestoreDefaultsButton)) {
			RestoreDefaultsButton.instances.set(id, new this({ id, type, restoreKeys }));
		}

		return <RestoreDefaultsButton>RestoreDefaultsButton.instances.get(id);
	}

	public toggle() {
		([...this.inputs].some(([key, input]) => !input.isSelfHidden && input.getValue() !== CONFIGURATION.FIELDS[<keyof SavedFields>key].defaultValue))
			? this.show()
			: this.hide();
	}

	protected async restoreInputs() {
		[...this.inputs].forEach(([key, input]) => {
			const { defaultValue } = CONFIGURATION.FIELDS[<keyof SavedFields>key];
			input.setValue(defaultValue);
		});
	}

	public async restore() {
		this.restoreInputs();
		this.toggle();
	}
}

export class RestoreSavedButton extends RestoreDefaultsButton {
	private restoreOptions: () => Promise<void>;

	protected constructor({ id, type, restoreKeys, restoreOptions }: {
		id: string;
		type: string;
		restoreKeys: (keyof SavedFields)[];
		restoreOptions: () => Promise<void>;
	}) {
		super({ id, type, restoreKeys });

		this.restoreOptions = restoreOptions;
	}

	public static override getInstance<T extends string>({ id, type = 'restore saved button', restoreKeys, restoreOptions }: {
		id: T;
		type?: string;
		restoreKeys: (keyof SavedFields)[];
		restoreOptions: () => Promise<void>;
	}): RestoreDefaultsButton {
		if (!(RestoreSavedButton.instances.get(id) instanceof RestoreSavedButton)) {
			RestoreSavedButton.instances.set(id, new this({ id, type, restoreKeys, restoreOptions }));
		}

		return <RestoreSavedButton>RestoreSavedButton.instances.get(id);
	}

	public override async toggle() {
		const savedFields = await Storage.getSavedFields();

		const anyUnsavedInputs = [...this.inputs]
			.reduce((hasUnsaved, [key, input]) => {
				const isUnsaved = input.markModified(savedFields[<keyof SavedFields>key]);

				return hasUnsaved || isUnsaved;
			}, false);

		(anyUnsavedInputs)
			? this.show()
			: this.hide();
	}

	protected override async restoreInputs() {
		await this.restoreOptions();

		[...this.inputs.values()].forEach(input => input.dispatchInputEvent());
	}
}