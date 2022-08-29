import { Element } from './Element';
import { Input } from './Input';

import { SupportedTypes } from '../options/configuration';

interface Segment<T, V> {
	id: T;
	value: V;
	default?: boolean;
	showDependents?: boolean;
}

type Segments<T, V> = (
	Segment<T, V> & {
		input: Input;
	}
)[];

export class SegmentedControl extends Element {
	private segments: Segments<string, SupportedTypes>;

	private constructor({ id, type, segments }: {
		id: string;
		type: string;
		segments: Segment<string, SupportedTypes>[];
	}) {
		super({ id, type });

		this.segments = segments.map(segment => ({
			...segment,
			input: Input.getInstance({
				id: segment.id,
				type: 'segmented control input',
			}),
		}));
	}

	public static override getInstance<T extends string, V extends SupportedTypes>({ id, type = 'segmented control', segments }: {
		id: T;
		type?: string;
		segments?: Segment<T, V>[];
	}): SegmentedControl {
		if (!segments) throw new Error(`You must declare the segments for this SegmentedControl ${id}!`);

		if (!(SegmentedControl.instances.get(id) instanceof SegmentedControl)) {
			SegmentedControl.instances.set(id, new SegmentedControl({ id, type, segments }));
		}

		return <SegmentedControl>SegmentedControl.instances.get(id);
	}

	public async validate() {
		return await this.getValue();
	}

	private getCheckedSegment() {
		return this.element.querySelector('input:checked');
	}

	public getValue(): SupportedTypes {
		const checkedSegment = this.getCheckedSegment();

		if (!checkedSegment) return this.segments.find(segment => Boolean(segment.default))?.value ?? null;

		return this.segments.find(({ id }) => id === checkedSegment.id)?.value ?? null;
	}

	public setValue(value: SupportedTypes, dispatchEvent = true) {
		let segmentToCheck = this.segments.find(segment => segment.value === value);

		// ! see #68
		if (!segmentToCheck && this.id === 'display-theme' && value === null) {
			segmentToCheck = this.segments.find(segment => segment.value === 'system');
		}

		if (!segmentToCheck) throw new Error(`Failed to set unexpected value ${value} of type ${typeof value} on segmented control ${this.id}`);

		segmentToCheck.input.setValue(true, false);

		if (!dispatchEvent) return;
		this.dispatchInputEvent();
	}

	public markModified(comparand: SupportedTypes) {
		const isModified = (!this.isSelfHidden && this.getValue() !== comparand);

		this.getLabels().forEach(label => {
			(isModified)
				? label.classList.add('unsaved')
				: label.classList.remove('unsaved');
		});

		return isModified;
	}

	public override show() {
		super.show();
		this.dispatchInputEvent();
	}

	public override hide() {
		super.hide();
		this.dispatchInputEvent();
	}

	public dispatchInputEvent(bubbles?: boolean) {
		this.dispatchEvent(new Event('input', { bubbles }));
	}

	public toggleDependents(dependents: readonly string[]) {
		const checkedSegment = this.getCheckedSegment();

		const showDependents = this.segments.find(({ id }) => id === checkedSegment?.id)?.showDependents;

		if (!checkedSegment || this.isSelfHidden || !showDependents) {
			dependents.forEach(dependentId => {
				const dependent = Element.getInstance({
					id: dependentId,
					type: 'dependent',
				});
				dependent.hide();
				dependent.dispatchEvent(new Event('input', { bubbles: true }));
			});

			return;
		}

		dependents.forEach(dependentId => {
			const dependent = Element.getInstance({
				id: dependentId,
				type: 'dependent',
			});
			dependent.show();
			dependent.dispatchEvent(new Event('input', { bubbles: true }));
		});
	}
}