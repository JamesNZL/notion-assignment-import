export type valueof<T> = T[keyof T];
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// makes each property optional and turns each property into unknown, allowing for type overrides by narrowing unknown
type PartialAny<T> = {
	[P in keyof T]?: unknown;
};

export type ModifyDeep<A, B> = A extends object
	? B extends PartialAny<A>
	? {
		[K in keyof A]: K extends keyof B
		? B[K] extends object
		? ModifyDeep<A[K], B[K]>
		: B[K]
		: A[K]
	} & (A extends object ? Omit<B, keyof A> : A)
	: A & B
	: B;

export type NonNullableValues<T> = {
	[K in keyof T]: NonNullable<T[K]>;
};

export function areHTMLElements<K extends string>(object: Record<K, HTMLElement | null>): object is Record<K, HTMLElement> {
	return (Object.values(object).every(element => element !== null));
}