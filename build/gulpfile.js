const { src, dest, series, parallel } = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const zip = require('gulp-zip');

const fs = require('fs');

const autoprefixer = require('gulp-autoprefixer');

const gulpEsbuild = require('gulp-esbuild');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
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
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/popup/parse.ts`,
			outDir: 'popup',
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/options/options.ts`,
			outDir: 'options',
		},
	],
};

function clean() {
	return del(`${CONFIGURATION.DIRECTORIES.OUT}/**`, { force: true });
}

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

function bundle(vendor, source) {
	return function bundleGlob() {
		return src(source.glob)
			.pipe(gulpEsbuild({
				outdir: source?.outDir,
				bundle: true,
				minify: !debug,
				sourcemap: debug,
				tsconfig: CONFIGURATION.FILES.TSCONFIG,
			}))
			.pipe(dest(`${CONFIGURATION.DIRECTORIES.OUT}/${vendor}`));
	};
}

function release(vendor) {
	return function releaseVendor() {
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

exports.default = series(clean,
	parallel(
		...Object.entries(sources.manifests).map(([vendor, manifest]) => parallel(
			copy(vendor, manifest),
			...sources.markup.map(source => copy(vendor, source)),
			...sources.style.map(source => prefix(vendor, source)),
			...sources.assets.map(source => copy(vendor, source)),
			...sources.scripts.map(source => bundle(vendor, source)),
		)),
	),
);

exports.release = parallel(
	...Object.keys(sources.manifests).map(release),
);