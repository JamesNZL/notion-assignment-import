export { Element } from './Element';
export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { KeyValueGroup } from './KeyValueGroup';
export { SegmentedControl } from './SegmentedControl';

export function getElementById<T extends string>(id: T): HTMLElement | null {
	return document.getElementById(id);
}