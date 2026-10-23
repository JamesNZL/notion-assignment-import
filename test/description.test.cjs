/* eslint-env node, es2021 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const base = 'https://canvas.example.edu/courses/12/assignments/34?view=full';
const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/issue-344.html'), 'utf8');

// Compile checked-in TypeScript in memory; no emitted files or browser/credentials.
function loadSource(relativePath, mocks = {}, cache = new Map()) {
	const filename = path.join(root, relativePath);
	if (cache.has(filename)) return cache.get(filename).exports;
	const source = fs.readFileSync(filename, 'utf8');
	const compiled = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, esModuleInterop: true },
	}).outputText;
	const loaded = new Module(filename, module);
	loaded.filename = filename;
	loaded.paths = Module._nodeModulePaths(path.dirname(filename));
	const originalRequire = loaded.require.bind(loaded);
	loaded.require = request => {
		if (Object.hasOwn(mocks, request)) return mocks[request];
		if (request.startsWith('.')) {
			const target = path.resolve(path.dirname(filename), request + '.ts');
			if (fs.existsSync(target)) return loadSource(path.relative(root, target), mocks, cache);
		}
		return originalRequire(request);
	};
	cache.set(filename, loaded);
	loaded._compile(compiled, filename);
	return loaded.exports;
}

const { descriptionToBlocks } = loadSource('src/popup/description.ts');
function richTexts(value, result = []) {
	if (!value || typeof value !== 'object') return result;
	if (value.type === 'text' && value.text) result.push(value);
	Object.values(value).forEach(child => richTexts(child, result));
	return result;
}
function links(blocks) {
	return richTexts(blocks).flatMap(item => item.text.link ? [item.text.link.url] : []);
}
function labelBlocks(target, assignmentUrl = base) {
	return descriptionToBlocks(`<p><a href="${target}"><strong>Label</strong> <em>tail</em></a></p>`, assignmentUrl);
}
function assertLabel(blocks) {
	const texts = richTexts(blocks);
	assert.equal(texts.map(item => item.text.content).join(''), 'Label tail');
	assert.equal(texts.find(item => item.text.content === 'Label').annotations.bold, true);
	assert.equal(texts.find(item => item.text.content === 'tail').annotations.italic, true);
}

test('original issue fixture resolves all seven anchors and preserves six absolute links', () => {
	const blocks = descriptionToBlocks(fixture, base);
	assert.equal(blocks.length, 32);
	assert.equal(links(blocks).length, 13);
	for (const [fragment, count] of [['#Purpose', 1], ['#Instructions', 1], ['#Grades', 1], ['#Bottom', 1], ['#top', 3]]) {
		assert.equal(links(blocks).filter(url => url === new URL(fragment, base).href).length, count);
	}
	assert.equal(links(blocks).filter(url => url.startsWith('https://redacted.instructure.com/')).length, 6);
	assert.deepEqual(descriptionToBlocks(fixture.replace(/ (?:style|class|id)="[^"]*"/g, ''), base), blocks);
	const TurndownService = require('turndown');
	const { markdownToBlocks } = require('@tryfabric/martian');
	const expected = markdownToBlocks(new TurndownService().turndown(fixture));
	richTexts(expected).forEach(item => {
		if (item.text.link) item.text.link.url = new URL(item.text.link.url, base).href;
	});
	assert.deepEqual(blocks, expected);
});

for (const target of ['#Purpose', '#', '/courses/12/pages/topic', '../pages/topic', 'pages/topic', '?preview=1', '//cdn.example.com/page']) {
	test(`resolve ${target} against assignment URL`, () => {
		const blocks = labelBlocks(target);
		assert.deepEqual([...new Set(links(blocks))], [new URL(target, base).href]);
		assertLabel(blocks);
	});
}

for (const target of ['https://example.com/a?q=1#top', 'http://example.com/a', 'https://example.com/a(b)', 'https://example.com/a b?q=(a)', 'https://example.com/a%20b?q=%2F#%E7%9B%AE', 'https://例え.テスト/课程?q=作业#目标', '../pages/hello world', '  https://example.com/path  ', 'mailto:teacher@example.com', 'mailto:teacher@example.com?subject=Hello%20world', 'tel:+123', 'https://example.com/%ZZ', 'https://example.com/%ZZ/a%20b?q=%2F&literal=%oops#%ZZ', '../pages/%ZZ/a%20b?q=%2F&literal=%oops#%ZZ']) {
	test(`preserve/encode accepted target ${target}`, () => {
		const blocks = labelBlocks(target);
		assert.deepEqual([...new Set(links(blocks))], [new URL(target.trim(), base).href]);
		assertLabel(blocks);
	});
}

for (const target of ['javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,hello', 'vbscript:msgbox(1)', 'file:///tmp/a', 'ftp://example.com/a', 'mailto:', 'tel:', 'mailto://example.com', 'tel://example.com', 'https://', 'https://[bad]', 'https:example.com', 'https://user:password@example.com/a', 'https://example.com/a\tb', 'https://example.com/a\\b', '']) {
	test(`invalid/unsupported target retains formatted label: ${JSON.stringify(target)}`, () => {
		const blocks = labelBlocks(target);
		assert.deepEqual(links(blocks), []);
		assertLabel(blocks);
	});
}

test('HTML entities are decoded once and query/fragment semantics survive', () => {
	const blocks = labelBlocks('https://example.com/?a=1&amp;b=2#part');
	assert.deepEqual([...new Set(links(blocks))], ['https://example.com/?a=1&b=2#part']);
	assert.deepEqual(links(descriptionToBlocks('<a href="java&#x73;cript:alert(1)">Keep</a>', base)), []);
	assert.deepEqual(links(descriptionToBlocks('<a href="https://example.com/?a=1&amp;amp;b=2">Keep</a>', base)), ['https://example.com/?a=1&amp;b=2']);
});

for (const assignmentUrl of [undefined, '', '/courses/1', 'javascript:alert(1)', 'https://', 'https://user:password@canvas.example.edu/a', 'mailto:teacher@example.com', 'tel:+123']) {
	test(`missing/invalid base ${JSON.stringify(assignmentUrl)} drops relative target only`, () => {
		const relative = descriptionToBlocks('<a href="#Purpose"><strong>Label</strong></a>', assignmentUrl);
		assert.deepEqual(links(relative), []);
		assert.equal(richTexts(relative)[0].annotations.bold, true);
		assert.deepEqual(links(descriptionToBlocks('<a href="https://example.com/a">Label</a>', assignmentUrl)), ['https://example.com/a']);
	});
}

for (const length of [1999, 2000, 2001]) {
	test(`serialized URL length boundary ${length} for anchor and GFM autolink`, () => {
		const prefix = 'https://example.com/';
		const url = prefix + 'a'.repeat(length - prefix.length);
		const blocks = descriptionToBlocks(`<p><a href="${url}"><strong>Label</strong></a></p><p>${url}</p>`, base);
		assert.deepEqual(links(blocks), (length <= 2000) ? [url, url] : []);
		assert.ok(richTexts(blocks).some(item => item.text.content === 'Label' && item.annotations.bold));
	});
}

test('length is enforced after relative resolution and Unicode percent encoding', () => {
	const prefix = 'https://example.com/';
	const target = prefix + '字'.repeat(221);
	assert.ok(target.length < 2000 && new URL(target).href.length > 2000);
	assert.deepEqual(links(labelBlocks(target)), []);
	assert.deepEqual(links(labelBlocks('a'.repeat(2000))), []);
});

test('GFM bare email and nested mailto/tel keep exact targets and formatting', () => {
	const blocks = descriptionToBlocks('<p>teacher@example.com</p><blockquote><a href="mailto:teacher@example.com"><strong>Email</strong></a><ul><li><a href="tel:+123"><em>Phone</em></a></li></ul></blockquote>', base);
	assert.deepEqual(links(blocks), ['mailto:teacher@example.com', 'mailto:teacher@example.com', 'tel:+123']);
	assert.equal(richTexts(blocks).find(item => item.text.content === 'Email').annotations.bold, true);
	assert.equal(richTexts(blocks).find(item => item.text.content === 'Phone').annotations.italic, true);
});

test('adjacent unsupported anchors keep exact visible labels and annotations', () => {
	const html = '<a href="ftp://example.com/a"><strong>FTP</strong></a><a href="javascript:alert(1)"><em>JS</em></a><a href="data:text/plain,hello">Data</a>';
	const actual = richTexts(descriptionToBlocks(html, base)).map(item => ({ text: item.text.content, bold: item.annotations.bold, italic: item.annotations.italic, link: item.text.link?.url ?? null }));
	assert.deepEqual(actual, [
		{ text: 'FTP', bold: true, italic: false, link: null },
		{ text: 'JS', bold: false, italic: true, link: null },
		{ text: 'Data', bold: false, italic: false, link: null },
	]);
});

const anchorVariants = [
	['no-attributes', ''],
	['id', 'id="section"'],
	['name', 'name="section"'],
	['empty-href', 'href=""'],
	['malformed-href', 'href="https://"'],
	['unsupported-href', 'href="javascript:alert(1)"'],
	['relative-href', 'href="#section"'],
	['absolute-href', 'href="https://example.com/resource"'],
];
const structuralAnchorCases = [
	{ name: 'image', html: '<img src="https://example.com/diagram.png" alt="Diagram">', types: ['image'], text: '' },
	{ name: 'nested-image', html: '<span><img src="https://example.com/diagram.png" alt="Diagram"></span>', types: ['image'], text: '' },
	{ name: 'heading', html: '<h2>Section</h2>', types: ['heading_2'], text: 'Section' },
	{ name: 'paragraphs', html: '<p>First</p><p>Second</p>', types: ['paragraph', 'paragraph'], text: 'FirstSecond' },
	{ name: 'list', html: '<ul><li>First</li><li>Second</li></ul>', types: ['bulleted_list_item', 'bulleted_list_item'], text: 'FirstSecond' },
	{ name: 'code', html: '<pre><code>const answer = 42;\nprint(answer);</code></pre>', types: ['code'], text: 'const answer = 42;\nprint(answer);' },
	{ name: 'image-and-text', html: '<strong>Intro</strong><img src="https://example.com/diagram.png" alt="Diagram"><em>Tail</em>', types: ['paragraph', 'image'], text: 'IntroTail' },
	{ name: 'nested-blocks', html: '<blockquote><p>Quoted</p><ul><li>Item</li></ul></blockquote>', types: ['quote'], text: 'QuotedItem' },
];

for (const [variant, attributes] of anchorVariants) {
	for (const example of structuralAnchorCases) {
		test(`${variant} anchor preserves ${example.name} source semantics`, () => {
			const blocks = descriptionToBlocks(`<a ${attributes}>${example.html}</a>`, base);
			assert.deepEqual(blocks.map(block => block.type), example.types);
			assert.equal(richTexts(blocks).map(item => item.text.content).join(''), example.text);
			const target = (variant === 'relative-href') ? new URL('#section', base).href : (variant === 'absolute-href') ? 'https://example.com/resource' : null;
			const linkedText = richTexts(blocks).filter(item => item.text.link);
			assert.deepEqual(links(blocks), (target && example.name !== 'code') ? richTexts(blocks).filter(item => item.text.content).map(() => target) : []);
			assert.ok(linkedText.every(item => item.text.link.url === target));
			if (example.name.includes('image')) {
				assert.equal(blocks.find(block => block.type === 'image').image.external.url, 'https://example.com/diagram.png');
			}
			if (example.name === 'image-and-text') {
				assert.equal(richTexts(blocks).find(item => item.text.content === 'Intro').annotations.bold, true);
				assert.equal(richTexts(blocks).find(item => item.text.content === 'Tail').annotations.italic, true);
			}
			const TurndownService = require('turndown');
			const { markdownToBlocks } = require('@tryfabric/martian');
			const expectedContent = markdownToBlocks(new TurndownService().turndown(example.html));
			const contentOnly = JSON.parse(JSON.stringify(blocks));
			richTexts(contentOnly).forEach(item => { delete item.text.link; });
			assert.deepEqual(contentOnly, JSON.parse(JSON.stringify(expectedContent)));
		});
	}
	test(`${variant} adjacent inline anchors preserve labels and emphasis boundaries`, () => {
		const html = `<a ${attributes}><strong>FTP</strong></a><a ${attributes}><em>JS</em></a><a ${attributes}>Data</a>`;
		const actual = richTexts(descriptionToBlocks(html, base)).map(item => ({ text: item.text.content, bold: item.annotations.bold, italic: item.annotations.italic, link: item.text.link?.url ?? null }));
		const target = (variant === 'relative-href') ? new URL('#section', base).href : (variant === 'absolute-href') ? 'https://example.com/resource' : null;
		assert.deepEqual(actual, [
			{ text: 'FTP', bold: true, italic: false, link: target },
			{ text: 'JS', bold: false, italic: true, link: target },
			{ text: 'Data', bold: false, italic: false, link: target },
		]);
	});
}

test('structural anchor unwrapping preserves its independent child links', () => {
	const blocks = descriptionToBlocks('<a href="javascript:alert(1)"><p>First</p><p><a href="../pages/topic"><strong>Child</strong></a></p></a>', base);
	assert.equal(richTexts(blocks).map(item => item.text.content).join(''), 'FirstChild');
	assert.deepEqual(links(blocks), [new URL('../pages/topic', base).href]);
	assert.equal(richTexts(blocks).find(item => item.text.content === 'Child').annotations.bold, true);
});

for (const [name, html] of [
	['plain', 'First<br>Second'],
	['formatted', '<strong>First</strong><br><em>Second</em>'],
	['source-newline', '<strong>First</strong>\n<em>Second</em>'],
]) {
	test(`valid inline ${name} multiline anchor retains target and formatting`, () => {
		const blocks = descriptionToBlocks(`<a href="https://example.com/">${html}</a>`, base);
		assert.deepEqual(blocks.map(block => block.type), ['paragraph']);
		assert.deepEqual(links(blocks), richTexts(blocks).map(() => 'https://example.com/'));
		assert.equal(richTexts(blocks).map(item => item.text.content).join('').replace(/\s/g, ''), 'FirstSecond');
		if (name !== 'plain') {
			assert.equal(richTexts(blocks).find(item => item.text.content === 'First').annotations.bold, true);
			assert.equal(richTexts(blocks).find(item => item.text.content === 'Second').annotations.italic, true);
		}
	});
}

test('valid media wrapper preserves links on nested formatted text and image URL', () => {
	const blocks = descriptionToBlocks('<a href="https://example.com/"><span><strong>Intro</strong><img src="https://example.com/diagram.png" alt="Diagram"><em>Tail</em></span></a>', base);
	assert.deepEqual(blocks.map(block => block.type), ['paragraph', 'image']);
	assert.deepEqual(links(blocks), ['https://example.com/', 'https://example.com/']);
	assert.equal(richTexts(blocks).map(item => item.text.content).join(''), 'IntroTail');
	assert.equal(richTexts(blocks)[0].annotations.bold, true);
	assert.equal(richTexts(blocks)[1].annotations.italic, true);
	assert.equal(blocks[1].image.external.url, 'https://example.com/diagram.png');
});

test('media inside a transparent ancestor keeps linked text, escapes and emphasis', () => {
	const target = 'https://example.com/%ZZ?a=%2F&b=1';
	const blocks = descriptionToBlocks('<a href="https://example.com/%ZZ?a=%2F&amp;b=1"><span><strong>Before</strong><span><img src="https://example.com/diagram.png" alt="Diagram"></span><em>After</em></span></a>', base);
	assert.deepEqual(blocks.map(block => block.type), ['paragraph', 'image']);
	assert.equal(richTexts(blocks).map(item => item.text.content).join(''), 'BeforeAfter');
	assert.deepEqual(links(blocks), [target, target]);
	assert.equal(richTexts(blocks)[0].annotations.bold, true);
	assert.equal(richTexts(blocks)[1].annotations.italic, true);
	assert.equal(blocks[1].image.external.url, 'https://example.com/diagram.png');
});

for (const target of ['mailto:teacher@example.com', 'tel:+123']) {
	test(`${target.split(':')[0]} structural wrapper keeps inline code link and image`, () => {
		const blocks = descriptionToBlocks(`<a href="${target}"><code>Before</code><img src="https://example.com/diagram.png" alt="Diagram"><em>After</em></a>`, base);
		assert.deepEqual(blocks.map(block => block.type), ['paragraph', 'image']);
		assert.deepEqual(links(blocks), [target, target]);
		assert.equal(richTexts(blocks)[0].text.content, 'Before');
		assert.equal(richTexts(blocks)[0].annotations.code, true);
		assert.equal(richTexts(blocks)[1].text.content, 'After');
		assert.equal(richTexts(blocks)[1].annotations.italic, true);
		assert.equal(blocks[1].image.external.url, 'https://example.com/diagram.png');
	});
}

for (const [variant, attributes] of anchorVariants.filter(([name]) => ['id', 'empty-href', 'unsupported-href', 'absolute-href'].includes(name))) {
	test(`${variant} block anchor keeps boundaries when outer whitespace is trimmed`, () => {
		const blocks = descriptionToBlocks(`Before<a ${attributes}><p> Middle </p></a>After`, base);
		assert.deepEqual(blocks.map(block => block.type), ['paragraph', 'paragraph', 'paragraph']);
		assert.deepEqual(blocks.map(block => richTexts(block).map(item => item.text.content).join('')), ['Before', 'Middle', 'After']);
		assert.deepEqual(links(blocks), (variant === 'absolute-href') ? ['https://example.com/resource'] : []);
	});
}

test('Canvas base remains absolute HTTP(S), including a literal percent path', () => {
	assert.deepEqual(links(descriptionToBlocks('<a href="#top">Top</a>', 'https://canvas.example.edu/%ZZ')), ['https://canvas.example.edu/%ZZ#top']);
	for (const assignmentUrl of ['mailto:teacher@example.com', 'tel:+123', 'ftp://canvas.example.edu/a']) {
		assert.deepEqual(links(descriptionToBlocks('<a href="#top">Top</a>', assignmentUrl)), []);
		assert.deepEqual(links(descriptionToBlocks('<a href="mailto:teacher@example.com">Email</a>', assignmentUrl)), ['mailto:teacher@example.com']);
	}
});

for (const scheme of ['mailto', 'tel']) {
	for (const length of [1999, 2000, 2001]) {
		test(`${scheme} final URL length boundary ${length}`, () => {
			const prefix = (scheme === 'mailto') ? 'mailto:teacher@example.com?subject=' : 'tel:+';
			const url = prefix + '1'.repeat(length - prefix.length);
			const blocks = labelBlocks(url);
			assert.deepEqual(links(blocks), (length <= 2000) ? [url, url, url] : []);
			assertLabel(blocks);
		});
	}
}

test('nested heading, quote and list links are normalized without losing inline annotations', () => {
	const html = '<h2><a href="#head"><em>Heading</em></a></h2><blockquote><a href="javascript:alert(1)"><strong>Quote</strong></a></blockquote><ul><li>Outer<ul><li><a href="../pages/topic"><em>Nested</em></a></li></ul></li></ul>';
	const blocks = descriptionToBlocks(html, base);
	assert.deepEqual(links(blocks), [new URL('#head', base).href, new URL('../pages/topic', base).href]);
	for (const [label, annotation] of [['Heading', 'italic'], ['Quote', 'bold'], ['Nested', 'italic']]) {
		assert.equal(richTexts(blocks).find(item => item.text.content === label).annotations[annotation], true);
	}
});

test('defensive pass covers table cells/captions and does not rewrite image URLs', () => {
	const bad = () => ({ type: 'text', annotations: { bold: true }, text: { content: 'Keep', link: { url: 'javascript:alert(1)' } } });
	const payload = [{ type: 'table', table: { children: [{ type: 'table_row', table_row: { cells: [[bad()]] } }] } }, { type: 'image', image: { external: { url: '/media.png' }, caption: [bad()] } }];
	const converter = loadSource('src/popup/description.ts', { '@tryfabric/martian': { markdownToBlocks: () => payload } });
	assert.deepEqual(links(converter.descriptionToBlocks('<p>input</p>', base)), []);
	assert.equal(payload[1].image.external.url, '/media.png');
	assert.ok(richTexts(payload).every(item => item.text.content === 'Keep' && item.annotations.bold));
});

test('custom/malformed HTML and id-only anchors preserve text', () => {
	const blocks = descriptionToBlocks('<custom-widget><a id="top">Start</a><div><a href="#top"><strong>Label</strong></custom-widget>', base);
	assert.deepEqual(links(blocks), [new URL('#top', base).href]);
	assert.ok(richTexts(blocks).some(item => item.text.content.includes('Start')));
});

test('null and empty descriptions produce no children', () => {
	assert.deepEqual(descriptionToBlocks(null, base), []);
	assert.deepEqual(descriptionToBlocks('', base), []);
});

test('actual exportToNotion builds normalized create parameters without live APIs', async () => {
	const descriptions = [fixture, null, '', '<a href="javascript:alert(1)"><strong>Keep</strong></a>', '<p>teacher@example.com</p><a href="mailto:teacher@example.com"><strong>Email</strong></a><a href="tel:+123">Phone</a><a href="https://example.com/%ZZ/a%20b?q=%2F">Percent</a>', '<a id="figure"><img src="https://example.com/diagram.png" alt="Diagram"></a>', '<a id="section"><h2>Section</h2></a>', '<a id="section"><p>First</p><p>Second</p></a>', '<a href="https://example.com/"><strong>First</strong><br><em>Second</em></a>', '<a href="https://example.com/"><strong>Intro</strong><img src="https://example.com/diagram.png" alt="Diagram"><em>Tail</em></a>'];
	const assignments = descriptions.map((description, index) => ({ name: `Offline ${index}`, description, points: 1, course: 'Test', icon: null, url: `https://canvas.example.edu/courses/12/assignments/${index}`, available: null, due: null }));
	const calls = [];
	const storage = {
		getOptions: async () => ({ notion: { databaseId: 'offline-db', propertyNames: { name: 'Name', url: 'URL', course: 'Course' }, propertyValues: {}, importChanges: {}, importPastDueDates: true }, canvas: { importMissingDueDates: true } }),
		getSavedAssignments: async () => ({ Test: assignments }),
		getNotionAuthorisation: async () => ({ accessToken: 'offline-placeholder' }),
	};
	const { exportToNotion } = loadSource('src/popup/import.ts', {
		'../apis/storage': { Storage: storage },
		'../apis/notion': { NotionClient: { getInstance: () => ({ queryDatabase: async () => ({ results: [] }), createPage: async parameters => { calls.push(parameters); return { id: 'offline' }; } }) } },
	});
	const result = await exportToNotion();
	assert.equal(result.created.length, 10);
	assert.equal(calls.length, 10);
	calls.forEach((parameters, index) => {
		assert.deepEqual(parameters.children, descriptionToBlocks(descriptions[index], assignments[index].url));
		assert.equal(parameters.properties.URL.url, assignments[index].url);
	});
	assert.ok(links(calls[0].children).includes(assignments[0].url + '#Purpose'));
	assert.equal(links(calls[3].children).length, 0);
	assert.deepEqual(links(calls[4].children), ['mailto:teacher@example.com', 'mailto:teacher@example.com', 'tel:+123', 'https://example.com/%ZZ/a%20b?q=%2F']);
	assert.deepEqual(calls[5].children.map(block => block.type), ['image']);
	assert.equal(calls[5].children[0].image.external.url, 'https://example.com/diagram.png');
	assert.deepEqual(calls[6].children.map(block => block.type), ['heading_2']);
	assert.equal(richTexts(calls[6].children)[0].text.content, 'Section');
	assert.deepEqual(calls[7].children.map(block => block.type), ['paragraph', 'paragraph']);
	assert.deepEqual(richTexts(calls[7].children).map(item => item.text.content), ['First', 'Second']);
	assert.deepEqual(richTexts(calls[8].children).map(item => item.text.content), ['First', 'Second']);
	assert.deepEqual(links(calls[8].children), ['https://example.com/', 'https://example.com/']);
	assert.deepEqual(calls[9].children.map(block => block.type), ['paragraph', 'image']);
	assert.deepEqual(links(calls[9].children), ['https://example.com/', 'https://example.com/']);
	assert.equal(calls[9].children[1].image.external.url, 'https://example.com/diagram.png');
});
