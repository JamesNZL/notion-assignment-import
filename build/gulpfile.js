import gulp from 'gulp';
const { src, dest, series, parallel, watch: watchGlob } = gulp;

import { deleteAsync } from 'del';
import rename from 'gulp-rename';
import zip from 'gulp-zip';

import fs from 'fs';

import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

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
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/style/**/*.scss`,
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
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/popup/fetch.ts`,
			outDir: 'popup',
			outFile: 'fetch.js',
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/options/options.ts`,
			outDir: 'options',
			outFile: 'options.js',
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/background/background.ts`,
			outDir: 'background',
			outFile: 'background.js',
		},
	],
};

function clean() {
	return deleteAsync(`${CONFIGURATION.DIRECTORIES.OUT}/**`, { force: true });
}

/**
 * @param {string} vendor
 * @param {import('./').Source} source
 */
function copy(vendor, source) {
	return function copyGlob() {
		const copied = src(source.glob, { base: source?.base ?? '.', encoding: false });
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
 * @param {import('./').Source} source
 */
function render(vendor, source) {
	return function renderGlob() {
		const rendered = src(source.glob, { base: source?.base ?? '.' })
			.pipe(sass.sync())
			.pipe(postcss(
				(debug)
					? [autoprefixer]
					: [autoprefixer, cssnano],
			));
		return (
			(!source.outFile)
				? rendered
				: rendered
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
 * @param {typeof gulpEsbuild} bundler
 * @param {string} vendor
 * @param {import('./').Source} source
 */
function bundle(bundler, vendor, source) {
	return function bundleGlob() {
		return src(source.glob)
			.pipe(bundler({
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
			encoding: false,
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
			...sources.style.map(source => render(vendor, source)),
			...sources.assets.map(source => copy(vendor, source)),
			...sources.scripts.map(source => bundle(gulpEsbuild, vendor, source)),
		)),
	),
);

export function watch() {
	tsc({ options: '--watch --preserveWatchOutput' })();

	Object.entries(sources.manifests).forEach(([vendor]) => {
		sources.markup.forEach(source => watchGlob(source.glob, copy(vendor, source)));
		sources.style.forEach(source => watchGlob(source.glob, render(vendor, source)));
		sources.assets.forEach(source => watchGlob(source.glob, copy(vendor, source)));
		sources.scripts.forEach(source => watchGlob(`${CONFIGURATION.DIRECTORIES.SOURCE}/**/*.ts`, bundle(gulpEsbuild, vendor, source)));
	});
}

export const release = parallel(
	...Object.keys(sources.manifests).map(releaseVendor),
);