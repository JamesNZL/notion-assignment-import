export type valueof<T> = T[keyof T];
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export function assertHTMLElements(object: Record<string, HTMLElement | null>): object is Record<string, HTMLElement> {
	return (Object.values(object).every(element => element !== null));
}