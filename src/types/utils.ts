export type valueof<T> = T[keyof T];
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ModifyDeep<A extends AnyObject, B extends DeepPartialAny<A>> = {
	[K in keyof A]: B[K] extends never
	? A[K]
	: B[K] extends AnyObject
	? ModifyDeep<A[K], B[K]>
	: B[K]
} & (A extends AnyObject ? Omit<B, keyof A> : A);

// makes each property optional and turns each property into any, allowing for type overrides by narrowing any
type DeepPartialAny<T> = {
	[P in keyof T]?: T[P] extends AnyObject ? DeepPartialAny<T[P]> : any;
};

type AnyObject = Record<string, any>;

export function areHTMLElements<K extends string>(object: Record<K, HTMLElement | null>): object is Record<K, HTMLElement> {
	return (Object.values(object).every(element => element !== null));
}
