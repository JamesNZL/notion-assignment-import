import { ClientOptions } from '@notionhq/client/build/src/Client';
import { CreatePageParameters, SearchResponse } from '@notionhq/client/build/src/api-endpoints';

import { valueof, ArrayElement } from '../types/utils';

type DateRequest = NonNullable<NonNullable<Extract<valueof<CreatePageParameters['properties']>, { type?: 'date'; }>['date']>>;
export type TimeZoneRequest = DateRequest['time_zone'];

export type EmojiRequest = Extract<CreatePageParameters['icon'], { type?: 'emoji'; }>['emoji'];

export type RichTextItemResponse = ArrayElement<Extract<Extract<ArrayElement<SearchResponse['results']>, { object: 'database'; }>, { title: unknown; }>['title']>;

export interface PaginatedRequest {
	start_cursor?: string;
	page_size?: number;
}

export interface PaginatedResponse {
	has_more: boolean;
	next_cursor: string;
	results: object[];
	object: 'list';
}

export interface HandlerClientOptions extends ClientOptions {
	auth: string;
}

interface User {
	object: 'user';
	id: string;
	type?: string;
	name?: string;
	avatar_url?: string;
}

interface Owner {
	workspace?: true;
	type?: 'user';
	user?: User;
}

export interface AuthorisedResponse {
	access_token: string;
	workspace_id: string;
	workspace_name: string | null;
	workspace_icon: string | null;
	bot_id: string;
	owner: Owner;
}