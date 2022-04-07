const { src, dest, parallel } = require('gulp');
const zip = require('gulp-zip');

const fs = require('fs');

const browserify = require('browserify');
const tsify = require('tsify');
const sourceStream = require('vinyl-source-stream');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { debug = false } = yargs(hideBin(process.argv)).argv;

const sources = {
	map(key, func) {
		return this[key].map(func);
	},
	markup: [
		{
			glob: 'src/markup/*.html',
			base: 'src/markup',
		},
	],
	style: [
		{
			glob: 'src/style/*.css',
			base: 'src/style',
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
			glob: 'src/scripts/extension.ts',
			outFile: 'extension.js',
		},
		{
			glob: 'src/scripts/parseAssignments.ts',
			outFile: 'parseAssignments.js',
		},
		{
			glob: 'src/scripts/options.ts',
			outFile: 'options.js',
		},
	],
};

function copy(source) {
	return function copyGlob() {
		return src(source.glob, { base: source?.base ?? '.' })
			.pipe(dest('dist'));
	};
}

function bundle(source) {
	return function bundleGlob() {
		return browserify({
			debug,
			entries: source.glob,
		})
			.plugin(tsify)
			.plugin('tinyify')
			.bundle()
			.pipe(sourceStream(`${source?.outFile ?? 'bundle.js'}`))
			.pipe(dest('dist'));
	};
}

function release() {
	const { version } = JSON.parse(fs.readFileSync('manifest.json', { encoding: 'utf-8' }));

	return src(['dist/**/*', 'manifest.json'], {
		base: '.',
	})
		.pipe(zip(`notion-assignment-import_v${version}.zip`))
		.pipe(dest('releases'));
}

exports.default = parallel(
	...sources.map('markup', copy),
	...sources.map('style', copy),
	...sources.map('assets', copy),
	...sources.map('scripts', bundle),
);

exports.release = release;