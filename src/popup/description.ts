import TurndownService from 'turndown';
import { markdownToBlocks } from '@tryfabric/martian';

const MAX_LINK_LENGTH = 2000;

// Block elements rendered by Turndown cannot be Markdown link-label content.
const BLOCK_CONTENT = [
	'address,article,aside,audio,blockquote,body,canvas,center,dd,dir,div,dl,dt,fieldset,figcaption,figure',
	'footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,html,isindex,li,main,menu,nav,noframes',
	'noscript,ol,output,p,pre,section,table,tbody,td,tfoot,th,thead,tr,ul',
].join(',');
const MEDIA_CONTENT = 'img,picture,video,audio,iframe,object,embed,svg,canvas';

// Split a structural wrapper into ordinary inline links without putting media
// or block Markdown inside a link label. Work on a clone, never the input DOM.
function linkStructuralText(anchor: HTMLElement, url: string): HTMLElement {
	const clone = anchor.cloneNode(true) as HTMLElement;
	clone.removeAttribute('href');
	function visit(parent: HTMLElement): void {
		Array.from(parent.childNodes).forEach(child => {
			if (child.nodeType === 1) {
				const element = child as HTMLElement;
				if (element.nodeName === 'A' || element.nodeName === 'BR' || element.matches(`${MEDIA_CONTENT},pre`)) return;
				if (element.matches(BLOCK_CONTENT) || element.querySelector(`${BLOCK_CONTENT},${MEDIA_CONTENT},a`)) {
					visit(element);
					return;
				}
			}
			else if (child.nodeType !== 3 || !child.nodeValue?.trim()) return;
			const link = parent.ownerDocument.createElement('a');
			link.setAttribute('href', url);
			parent.insertBefore(link, child);
			link.appendChild(child);
		});
	}
	visit(clone);
	return clone;
}

function parseBodyLink(target: string, base?: string): string | null {
	const value = target.trim();
	if (!value || value.includes('\\')) return null;
	if (Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;

	// Do not let the URL parser repair malformed absolute URLs into relative paths.
	if (/^https?:/i.test(value) && !/^https?:\/\/[^/\\]/i.test(value)) return null;

	try {
		const url = new URL(value, base);
		if (['http:', 'https:'].includes(url.protocol)) {
			if (!url.hostname || url.username || url.password) return null;
		}
		else if (['mailto:', 'tel:'].includes(url.protocol)) {
			if (url.host || !url.pathname || url.pathname.startsWith('/')) return null;
		}
		else return null;
		return (url.href.length <= MAX_LINK_LENGTH) ? url.href : null;
	}
	catch {
		return null;
	}
}

function parseCanvasBase(target?: string): string | undefined {
	const url = (target) ? parseBodyLink(target) : null;
	return (url && /^https?:\/\//i.test(url)) ? url : undefined;
}

function normalizeRichTextLinks(value: unknown): void {
	if (!value || typeof value !== 'object') return;
	if (Array.isArray(value)) {
		value.forEach(normalizeRichTextLinks);
		return;
	}

	const object = value as Record<string, unknown>;
	if (object.type === 'text' && object.text && typeof object.text === 'object') {
		const text = object.text as Record<string, unknown>;
		if (text.link && typeof text.link === 'object') {
			const link = text.link as Record<string, unknown>;
			const url = (typeof link.url === 'string') ? parseBodyLink(link.url) : null;
			if (url) link.url = url;
			else delete text.link;
		}
	}

	// Includes nested list/quote children and rich text inside table cells/captions.
	Object.values(object).forEach(normalizeRichTextLinks);
}

/**
 * Resolve description links against the original Canvas assignment, never the
 * extension document. HTTP(S), mailto and tel links are retained; unsupported links
 * keep their visible content and inline formatting. Media URLs are unchanged.
 */
export function descriptionToBlocks(description: string | null, assignmentUrl?: string) {
	if (!description) return [];
	const base = parseCanvasBase(assignmentUrl);
	const turndown = new TurndownService();
	turndown.addRule('descriptionLinks', {
		filter: 'a',
		replacement: (content, node) => {
			const anchor = node as HTMLElement;
			const href = anchor.getAttribute('href');
			const url = (href) ? parseBodyLink(href, base) : null;
			// Render valid structural wrappers as links on their inline text only.
			// Invalid wrappers still unwrap. Preserve block boundaries even when
			// Turndown trims whitespace on the outer anchor.
			if (url && anchor.querySelector(`${BLOCK_CONTENT},${MEDIA_CONTENT}`)) {
				const linkedContent = turndown.turndown(linkStructuralText(anchor, url));
				return (anchor.querySelector(BLOCK_CONTENT)) ? `\n\n${linkedContent}\n\n` : linkedContent;
			}
			if (anchor.querySelector(BLOCK_CONTENT)) return `\n\n${content}\n\n`;
			if (anchor.querySelector(MEDIA_CONTENT)) return content;
			// Angle destinations preserve parentheses; escape entities so Markdown
			// does not decode an already HTML-decoded query a second time.
			// An empty destination drops the link while keeping Markdown boundaries
			// between adjacent labels, so emphasis cannot merge into literal text.
			return (url) ? `[${content}](<${url.replace(/&/g, '&amp;')}>)` : `[${content}]()`;
		},
	});

	const blocks = markdownToBlocks(turndown.turndown(description));
	// GFM may also generate links from visible URL text, outside anchor rules.
	normalizeRichTextLinks(blocks);
	return blocks;
}
