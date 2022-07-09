import gulp from 'gulp';
const { src, dest, series, parallel } = gulp;

import del from 'del';
import rename from 'gulp-rename';
import zip from 'gulp-zip';

import fs from 'fs';

import autoprefixer from 'gulp-autoprefixer';

import gulpEsbuild from 'gulp-esbuild';

import { exec } from 'gulp-execa';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
const debug = yargs(hideBin(process.argv)).argv.debug === 'true';

const CONFIGURATION = {
	DIRECTORIES: {
		SOURCE: 'src',
		OUT: 'dist',
		RELEASE: 'releases',
	},
	FILES: {
		TSCONFIG: 'src/tsconfig.json',
		BUNDLE: 'bundle.js',
	},
};

/**
 * @type {import('./').Sources}
 */
const sources = {
	manifests: {
		chromium: {
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/manifest-chromium.json`,
			outFile: 'manifest.json',
		},
		firefox: {
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/manifest-firefox.json`,
			outFile: 'manifest.json',
		},
	},
	markup: [
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/**/*.html`,
			base: `${CONFIGURATION.DIRECTORIES.SOURCE}/`,
		},
	],
	style: [
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/style/*.css`,
			base: `${CONFIGURATION.DIRECTORIES.SOURCE}/style`,
		},
	],
	assets: [
		{
			glob: 'assets/favicon/*',
			base: 'assets',
		},
	],
	scripts: [
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/popup/popup.ts`,
			outDir: 'popup',
			outFile: 'popup.js',
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/popup/parse.ts`,
			outDir: 'popup',
			outFile: 'parse.js',
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/options/options.ts`,
			outDir: 'options',
			outFile: 'options.js',
		},
	],
};

function clean() {
	return del(`${CONFIGURATION.DIRECTORIES.OUT}/**`, { force: true });
}

/**
 * @param {string} vendor
 * @param {import('./').Source} source
 */
function copy(vendor, source) {
	return function copyGlob() {
		const copied = src(source.glob, { base: source?.base ?? '.' });
		return (
			(!source.outFile)
				? copied
				: copied
					.pipe(rename(source.outFile))
		)
			.pipe(dest(`${CONFIGURATION.DIRECTORIES.OUT}/${vendor}`));
	};
}

/**
 * @param {string} vendor
 * @param {import('./').Source} source
 */
function prefix(vendor, source) {
	return function prefixGlob() {
		const prefixed = src(source.glob, { base: source?.base ?? '.' })
			.pipe(autoprefixer());
		return (
			(!source.outFile)
				? prefixed
				: prefixed
					.pipe(rename(source.outFile))
		)
			.pipe(dest(`${CONFIGURATION.DIRECTORIES.OUT}/${vendor}`));
	};
}

/**
 * @param {{ options?: string }} options
 */
function tsc({ options } = {}) {
	return function typeCheck() {
		return exec(`tsc --noEmit -p ${CONFIGURATION.FILES.TSCONFIG} ${options ?? ''}`);
	};
}

/**
 * @param {string} vendor
 * @param {import('./').Source} source
 */
function bundle(vendor, source) {
	return function bundleGlob() {
		return src(source.glob)
			.pipe(gulpEsbuild({
				outfile: source?.outFile,
				bundle: true,
				minify: !debug,
				sourcemap: debug,
				tsconfig: CONFIGURATION.FILES.TSCONFIG,
			}))
			.pipe(dest(`${CONFIGURATION.DIRECTORIES.OUT}/${vendor}/${source.outDir ?? ''}`));
	};
}

/**
 * @param {string} vendor
 */
function releaseVendor(vendor) {
	return function release() {
		const { version } = JSON.parse(fs.readFileSync(sources.manifests[vendor].glob, { encoding: 'utf-8' }));

		return src([`${CONFIGURATION.DIRECTORIES.OUT}/${vendor}/**/*`], {
			base: `${CONFIGURATION.DIRECTORIES.OUT}/${vendor}`,
		})
			.pipe(zip(`notion-assignment-import-${vendor}_v${version}.zip`))
			.pipe(dest(`${CONFIGURATION.DIRECTORIES.RELEASE}/${vendor}`))
			.pipe(rename(`notion-assignment-import-${vendor}_latest.zip`))
			.pipe(dest(`${CONFIGURATION.DIRECTORIES.RELEASE}/${vendor}`));
	};
}

export default series(clean,
	parallel(
		tsc(),
		...Object.entries(sources.manifests).map(([vendor, manifest]) => parallel(
			copy(vendor, manifest),
			...sources.markup.map(source => copy(vendor, source)),
			...sources.style.map(source => prefix(vendor, source)),
			...sources.assets.map(source => copy(vendor, source)),
			...sources.scripts.map(source => bundle(vendor, source)),
		)),
	),
);

export const release = parallel(
	...Object.keys(sources.manifests).map(releaseVendor),
);