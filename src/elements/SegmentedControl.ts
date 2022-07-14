import { Element } from './Element';

import { SupportedTypes } from '../options/configuration';
import { InputFieldValidator } from '../options/validator';

export class SegmentedControl extends Element {
	getValue(): SupportedTypes;
	validate(force?: boolean): Promise<SupportedTypes | typeof InputFieldValidator.INVALID_INPUT>;
	setValue(value: SupportedTypes, dispatchEvent?: boolean): void;
	show(): void;
	hide(): void;
	toggleDependents(dependents: readonly string[]): void;
	addEventListener(...args: Parameters<typeof HTMLElement.prototype.addEventListener>): void;
	dispatchInputEvent(bubbles?: boolean): void;
}