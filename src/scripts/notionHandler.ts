import { APIErrorCode, Client, isNotionClientError } from '@notionhq/client';
import { ClientOptions } from '@notionhq/client/build/src/Client';
import { CreatePageParameters, CreatePageResponse, QueryDatabaseParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

export type valueof<T> = T[keyof T];

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

export class NotionHandler extends Client {
	public constructor(options?: ClientOptions) {
		super(options);
	}

	private static async makeRequest<T, R>(method: (arg: T) => Promise<R>, parameters: T): Promise<void | R> {
		try {
			return await method(parameters);
		}

		catch (error: unknown) {
			if (isNotionClientError(error)) {
				if (error.code === APIErrorCode.RateLimited) {
					const retryAfter = parseInt(<NonNullable<string>>error.headers.get('Retry-After'));
					await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
					return await NotionHandler.makeRequest(method, parameters);
				}
			}

			const type = (isNotionClientError(error)) ? 'NOTION_ERROR' : 'UNKNOWN_ERROR';
			console.error({ type, error });
		}
	}

	private static async makePaginatedRequest<T, R>(method: (arg: T) => Promise<R>, parameters: T & PaginatedRequest): Promise<void | R> {
		let response = await NotionHandler.makeRequest(method, parameters);

		if (isPaginatedResponse(response)) {
			const _results = response.results;

			while (isPaginatedResponse(response) && response.has_more) {
				parameters.start_cursor = response.next_cursor;

				response = await NotionHandler.makeRequest(method, parameters);

				if (isPaginatedResponse(response)) _results.push(...response.results);
			}

			if (isPaginatedResponse(response)) response.results = _results;
		}

		return response;
	}

	public async queryDatabase(databaseId: string, filter?: QueryDatabaseParameters['filter']): Promise<void | QueryDatabaseResponse> {
		return await NotionHandler.makePaginatedRequest<QueryDatabaseParameters, QueryDatabaseResponse>(
			this.databases.query,
			{
				database_id: databaseId,
				filter,
			},
		);
	}

	public async createPage(parameters: CreatePageParameters): Promise<void | CreatePageResponse> {
		return await NotionHandler.makeRequest<CreatePageParameters, CreatePageResponse>(
			this.pages.create,
			parameters,
		);
	}
}