export { Button } from './Button';
export { Input } from './Input';

export function getElementById<T extends string>(id: T): HTMLElement | null {
	return document.getElementById(id);
}