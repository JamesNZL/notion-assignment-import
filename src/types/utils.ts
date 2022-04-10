export type valueof<T> = T[keyof T];
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export function areHTMLElements<K extends string>(object: Record<K, HTMLElement | null>): object is Record<K, HTMLElement> {
	return (Object.values(object).every(element => element !== null));
}