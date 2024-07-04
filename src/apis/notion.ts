import { APIErrorCode, Client, isNotionClientError } from '@notionhq/client';
import {
	CreatePageParameters,
	CreatePageResponse,
	GetDatabaseResponse,
	GetSelfResponse,
	QueryDatabaseParameters,
	QueryDatabaseResponse,
	SearchParameters,
	SearchResponse,
	UpdatePageParameters,
	UpdatePageResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { HandlerClientOptions, PaginatedRequest, PaginatedResponse, RichTextItemResponse } from '../types/notion';
import { ArrayElement } from '../types/utils';

function isPaginatedResponse<R>(response: void | R): response is (R & PaginatedResponse) {
	if (!response) return false;
	if (!(response instanceof Object)) return false;
	return 'has_more' in response;
}

export class NotionClient extends Client {
	private static instances = new Map<string, NotionClient>();
	private static validTokens = new Map<string, boolean>();
	// rate limits are stored in static field by auth as multiple instances may exist that use the same auth
	// this ensures a different secret is not affected if another is rate limited, while ensuring different instances
	// of the same secret cannot make new requests while rate limited
	private static rateLimits = new Map<string, {
		isRateLimited: boolean;
		retryAfterPromise: Promise<void> | null;
	}>();

	private auth: string;
	private requestCache = new Map<string, unknown>();

	private constructor(options: HandlerClientOptions) {
		super({
			...options,
			notionVersion: '2022-06-28',
		});
		this.auth = options.auth;

		NotionClient.rateLimits.set(options.auth, {
			isRateLimited: false,
			retryAfterPromise: null,
		});
	}

	public static getInstance(options: HandlerClientOptions): NotionClient {
		if (!NotionClient.instances.has(JSON.stringify(options))) {
			NotionClient.instances.set(JSON.stringify(options), new NotionClient(options));
		}

		return <NotionClient>NotionClient.instances.get(JSON.stringify(options));
	}

	public async validateToken() {
		if (!NotionClient.validTokens.has(this.auth)) {
			NotionClient.validTokens.set(this.auth, Boolean(await this.retrieveMe()));
		}

		return NotionClient.validTokens.get(this.auth);
	}

	private get isRateLimited() {
		return NotionClient.rateLimits.get(this.auth)?.isRateLimited ?? false;
	}

	private get retryAfterPromise() {
		return NotionClient.rateLimits.get(this.auth)?.retryAfterPromise ?? null;
	}

	private setRateLimit(retryAfterPromise: Promise<void>) {
		NotionClient.rateLimits.set(this.auth, {
			isRateLimited: true,
			retryAfterPromise,
		});
	}

	private clearRateLimit() {
		NotionClient.rateLimits.set(this.auth, {
			isRateLimited: false,
			retryAfterPromise: null,
		});
	}

	private static alertRateLimited() {
		alert('You are being rate-limited for making too many requests too quickly.\n\nLeave the extension popup open and I will automatically resume once you are no longer rate-limited.\n\nAlternatively, please try again in a few minutes\' time.');
	}

	private static async sleep(ms: number): Promise<void> {
		return await new Promise(resolve => setTimeout(resolve, ms));
	}

	private cacheRequest<T, R>(cacheKey: string, parameters: T, response: R): R {
		this.requestCache.set(JSON.stringify({
			cacheKey,
			parameters,
		}), response);

		return response;
	}

	private getCachedRequest<T, R>(cacheKey: string, parameters: T): undefined | R {
		return <undefined | R>this.requestCache.get(JSON.stringify({ cacheKey, parameters }));
	}

	private async makeRequest<T, R>(method: (arg: T) => Promise<R>, cacheKey: string, parameters: T, { cache, force }: { cache: boolean; force: boolean; }): Promise<void | R> {
		try {
			// if the handler is currently rate-limited, delay the request
			if (this.isRateLimited && this.retryAfterPromise !== null) {
				NotionClient.alertRateLimited();
				await this.retryAfterPromise;
			}

			const response = (force)
				? await method.call(this, parameters)
				: this.getCachedRequest<T, R>(cacheKey, parameters) ?? await method.call(this, parameters);

			return (cache)
				? this.cacheRequest<T, R>(cacheKey, parameters, response)
				: response;
		}

		catch (error: unknown) {
			const type = (isNotionClientError(error)) ? 'NOTION_ERROR' : 'UNKNOWN_ERROR';
			console.error({ type, error });

			if (!isNotionClientError(error)) return;

			switch (error.code) {
				case APIErrorCode.RateLimited: {
					if (!(error.headers instanceof Headers)) return;

					// get Retry-After header from API response
					const retryAfter = Number(error.headers.get('Retry-After'));

					// pause for Retry-After seconds
					this.setRateLimit(NotionClient.sleep(retryAfter * 1000));
					NotionClient.alertRateLimited();
					await this.retryAfterPromise;

					// reset rate-limit state
					this.clearRateLimit();

					// make the request again
					return await this.makeRequest(method, cacheKey, parameters, { cache, force });
				}
			}
		}
	}

	private async makePaginatedRequest<T, R>(method: (arg: T) => Promise<R>, cacheKey: string, parameters: T & PaginatedRequest, { cache, force }: { cache: boolean; force: boolean; }): Promise<void | R> {
		let response = await this.makeRequest(method, cacheKey, parameters, { cache, force });

		if (!isPaginatedResponse(response)) return response;

		const _results = response.results;

		while (isPaginatedResponse(response) && response.has_more) {
			parameters.start_cursor = response.next_cursor;

			response = await this.makeRequest(method, cacheKey, parameters, { cache, force });

			if (isPaginatedResponse(response)) _results.push(...response.results);
		}

		if (isPaginatedResponse(response)) response.results = _results;

		return response;
	}

	public async retrieveMe({ cache, force } = { cache: true, force: false }): Promise<void | GetSelfResponse> {
		return await this.makeRequest(
			this.users.me,
			'users.me',
			{},
			{
				cache,
				force,
			},
		);
	}

	public async queryDatabase(databaseId: string, filter?: QueryDatabaseParameters['filter'], { cache, force } = { cache: true, force: false }): Promise<void | QueryDatabaseResponse> {
		return await this.makePaginatedRequest(
			this.databases.query,
			'databases.query',
			{
				database_id: databaseId,
				filter,
			},
			{
				cache,
				force,
			},
		);
	}

	public async retrieveDatabase(databaseId: string, { cache, force } = { cache: true, force: false }): Promise<void | GetDatabaseResponse> {
		return await this.makeRequest(
			this.databases.retrieve,
			'databases.retrieve',
			{
				database_id: databaseId,
			},
			{
				cache,
				force,
			},
		);
	}

	public async createPage(parameters: CreatePageParameters): Promise<void | CreatePageResponse> {
		return await this.makeRequest(
			this.pages.create,
			'pages.create',
			parameters,
			{
				cache: false,
				force: true,
			},
		);
	}

	public async updatePageProperties(parameters: UpdatePageParameters): Promise<void | UpdatePageResponse> {
		return await this.makeRequest(
			this.pages.update,
			'pages.update',
			parameters,
			{
				cache: false,
				force: true,
			}
		);
	}

	public async searchShared({ query, sort, filter }: SearchParameters, { cache, force } = { cache: true, force: false }): Promise<void | SearchResponse> {
		return await this.makePaginatedRequest(
			this.search,
			'search',
			{
				query,
				sort,
				filter,
			},
			{
				cache,
				force,
			},
		);
	}

	public static resolveTitle(object: ArrayElement<SearchResponse['results']>, icon = true) {
		try {
			const richTextObjects: RichTextItemResponse[] = [];

			switch (object.object) {
				case ('page'): {
					if (!('properties' in object)) break;

					const titleProperty = Object.values(object.properties).find(({ type }) => type === 'title') ?? [];

					richTextObjects.push(...('title' in titleProperty) ? titleProperty.title : []);

					break;
				}
				case ('database'): {
					if (!('title' in object)) break;

					richTextObjects.push(...object.title);

					break;
				}
			}

			const title = (richTextObjects.length)
				? richTextObjects.map(({ plain_text }) => plain_text).join('')
				: null;

			if (!icon || !('icon' in object) || object.icon?.type !== 'emoji') return title;

			return `${object.icon.emoji} ${title}`;
		}

		catch (error) {
			console.warn('Failed to resolve Notion page title.', { error, object });
		}
	}
}