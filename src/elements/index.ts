export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';

export function getElementById<T extends string>(id: T): HTMLElement | null {
	return document.getElementById(id);
}