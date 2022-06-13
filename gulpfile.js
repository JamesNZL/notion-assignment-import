const { src, dest, series, parallel } = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const zip = require('gulp-zip');

const fs = require('fs');

const browserify = require('browserify');
const tsify = require('tsify');
const sourceStream = require('vinyl-source-stream');

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
	map(key, func) {
		return this[key].map(func);
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
			outFile: 'popup/popup.js',
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/popup/parse.ts`,
			outFile: 'popup/parse.js',
		},
		{
			glob: `${CONFIGURATION.DIRECTORIES.SOURCE}/options/options.ts`,
			outFile: 'options/options.js',
		},
	],
};

function clean() {
	return del(`${CONFIGURATION.DIRECTORIES.OUT}/**`, { force: true });
}

function copy(source) {
	return function copyGlob() {
		return src(source.glob, { base: source?.base ?? '.' })
			.pipe(dest(CONFIGURATION.DIRECTORIES.OUT));
	};
}

function bundle(source) {
	return function bundleGlob() {
		const tsified = browserify({
			debug,
			entries: source.glob,
		})
			.plugin(tsify, { project: CONFIGURATION.FILES.TSCONFIG });

		return (
			(debug)
				? tsified
				: tsified
					.plugin('tinyify')
		)
			.bundle()
			.pipe(sourceStream(`${source?.outFile ?? CONFIGURATION.FILES.BUNDLE}`))
			.pipe(dest(CONFIGURATION.DIRECTORIES.OUT));
	};
}

function release() {
	const { version } = JSON.parse(fs.readFileSync('manifest.json', { encoding: 'utf-8' }));

	return src([`${CONFIGURATION.DIRECTORIES.OUT}/**/*`, 'manifest.json'], {
		base: '.',
	})
		.pipe(zip(`notion-assignment-import_v${version}.zip`))
		.pipe(dest(CONFIGURATION.DIRECTORIES.RELEASE))
		.pipe(rename('notion-assignment-import_latest.zip'))
		.pipe(dest(CONFIGURATION.DIRECTORIES.RELEASE));
}

exports.default = series(clean,
	parallel(
		...sources.map('markup', copy),
		...sources.map('style', copy),
		...sources.map('assets', copy),
		...sources.map('scripts', bundle),
	),
);

exports.release = release;