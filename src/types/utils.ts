export type valueof<T> = T[keyof T];
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export function assertHTMLElements<K>(object: Record<K extends string ? K : never, HTMLElement | null>): object is Record<keyof typeof object, HTMLElement> {
	return (Object.values(object).every(element => element !== null));
}