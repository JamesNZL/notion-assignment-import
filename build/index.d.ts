export interface Source {
	glob: string;
	base?: string;
	outDir?: string;
	outFile?: string;
}

export type Sources = {
	manifests: {
		[vendor: string]: Source;
	};
} & {
	[type: string]: Source[];
};