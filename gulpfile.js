const { src, dest, parallel } = require('gulp');

const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { debug = false } = yargs(hideBin(process.argv)).argv;

const globs = {
	map(key, func) {
		return this[key].map(func);
	},
	markup: ['src/*.html'],
	style: ['src/*.css'],
	scripts: ['src/extension.ts', 'src/parseAssignments.ts', 'src/options.ts'],
};

function copy(glob) {
	return function copyGlob() {
		return src(glob).pipe(dest('dist'));
	};
}

function bundle(glob) {
	return function bundleGlob() {
		return browserify({
			debug,
			entries: glob,
		})
			.plugin(tsify)
			.plugin('tinyify')
			.bundle()
			.pipe(source(`${glob.match(/src\/(.*)\.ts/)[1]}.js`))
			.pipe(dest('dist'));
	};
}

exports.default = parallel(
	...globs.map('markup', copy),
	...globs.map('style', copy),
	...globs.map('scripts', bundle),
);