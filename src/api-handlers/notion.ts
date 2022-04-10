import { APIErrorCode, Client, isNotionClientError } from '@notionhq/client';
import { ClientOptions } from '@notionhq/client/build/src/Client';
import { CreatePageParameters, CreatePageResponse, QueryDatabaseParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import { valueof } from '../typings/utils';

type DateRequest = NonNullable<NonNullable<Extract<valueof<CreatePageParameters['properties']>, { type?: 'date'; }>['date']>>;
export type TimeZoneRequest = DateRequest['time_zone'];

export type EmojiRequest = Extract<CreatePageParameters['icon'], { type?: 'emoji'; }>['emoji'];

interface PaginatedRequest {
	start_cursor?: string;
	page_size?: number;
}

interface PaginatedResponse {
	has_more: boolean;
	next_cursor: string;
	results: object[];
	object: 'list';
}

function isPaginatedResponse<R>(response: void | R): response is (R & PaginatedResponse) {
	if (!response) return false;
	return 'has_more' in response;
}

interface HandlerClientOptions extends ClientOptions {
	auth: string;
}

export class NotionHandler extends Client {
	// rate limits are stored in static field by auth as multiple instances may exist that use the same auth
	// this ensures a different secret is not affected if another is rate limited, while ensuring different instances
	// of the same secret cannot make new requests while rate limited
	private static rateLimits: {
		[auth: string]: {
			isRateLimited: boolean;
			retryAfterPromise: Promise<void> | null;
		};
	} = {};

	private auth: string;

	public constructor(options: HandlerClientOptions) {
		super(options);
		this.auth = options.auth;
	}

	private get isRateLimited() {
		return NotionHandler.rateLimits[this.auth]?.isRateLimited ?? false;
	}

	private set isRateLimited(isRateLimited: boolean) {
		NotionHandler.rateLimits[this.auth].isRateLimited = isRateLimited;
	}

	private get retryAfterPromise() {
		return NotionHandler.rateLimits[this.auth]?.retryAfterPromise ?? null;
	}

	private set retryAfterPromise(promise: Promise<void> | null) {
		NotionHandler.rateLimits[this.auth].retryAfterPromise = promise;
	}

	private static alertRateLimited() {
		alert('You are being rate-limited for making too many requests too quickly.\n\nLeave this popup open and I will automatically resume once you are no longer rate-limited.\n\nAlternatively, please try again in a few minutes\' time.');
	}

	private static async sleep(ms: number): Promise<void> {
		return await new Promise(resolve => setTimeout(resolve, ms));
	}

	private async makeRequest<T, R>(method: (arg: T) => Promise<R>, parameters: T): Promise<void | R> {
		try {
			// if the handler is currently rate-limited, delay the request
			if (this.isRateLimited && this.retryAfterPromise !== null) {
				NotionHandler.alertRateLimited;
				await this.retryAfterPromise;
			}

			return await method(parameters);
		}

		catch (error: unknown) {
			const type = (isNotionClientError(error)) ? 'NOTION_ERROR' : 'UNKNOWN_ERROR';
			console.error({ type, error });

			if (isNotionClientError(error)) {
				if (error.code === APIErrorCode.RateLimited) {
					// get Retry-After header from API response
					const retryAfter = parseInt(<NonNullable<string>>error.headers.get('Retry-After'));

					// pause for Retry-After seconds
					this.isRateLimited = true;
					this.retryAfterPromise = NotionHandler.sleep(retryAfter * 1000);
					NotionHandler.alertRateLimited;
					await this.retryAfterPromise;

					// reset rate-limit state
					this.isRateLimited = false;
					this.retryAfterPromise = null;

					// make the request again
					return await this.makeRequest(method, parameters);
				}
			}
		}
	}

	private async makePaginatedRequest<T, R>(method: (arg: T) => Promise<R>, parameters: T & PaginatedRequest): Promise<void | R> {
		let response = await this.makeRequest(method, parameters);

		if (isPaginatedResponse(response)) {
			const _results = response.results;

			while (isPaginatedResponse(response) && response.has_more) {
				parameters.start_cursor = response.next_cursor;

				response = await this.makeRequest(method, parameters);

				if (isPaginatedResponse(response)) _results.push(...response.results);
			}

			if (isPaginatedResponse(response)) response.results = _results;
		}

		return response;
	}

	public async queryDatabase(databaseId: string, filter?: QueryDatabaseParameters['filter']): Promise<void | QueryDatabaseResponse> {
		return await this.makePaginatedRequest<QueryDatabaseParameters, QueryDatabaseResponse>(
			this.databases.query,
			{
				database_id: databaseId,
				filter,
			},
		);
	}

	public async createPage(parameters: CreatePageParameters): Promise<void | CreatePageResponse> {
		return await this.makeRequest<CreatePageParameters, CreatePageResponse>(
			this.pages.create,
			parameters,
		);
	}
}