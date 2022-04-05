"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionHandler = void 0;
const client_1 = require("@notionhq/client");
function isPaginatedResponse(response) {
    if (!response)
        return false;
    return 'has_more' in response;
}
class NotionHandler extends client_1.Client {
    constructor(options) {
        super(options);
    }
    static async makeRequest(method, parameters) {
        try {
            return await method(parameters);
        }
        catch (error) {
            const type = ((0, client_1.isNotionClientError)(error)) ? 'NOTION_ERROR' : 'UNKNOWN_ERROR';
            console.error({ type, error });
        }
    }
    static async makePaginatedRequest(method, parameters) {
        let response = await NotionHandler.makeRequest(method, parameters);
        if (isPaginatedResponse(response)) {
            const _results = response.results;
            while (isPaginatedResponse(response) && response.has_more) {
                parameters.start_cursor = response.next_cursor;
                response = await NotionHandler.makeRequest(method, parameters);
                if (isPaginatedResponse(response))
                    _results.push(...response.results);
            }
            if (isPaginatedResponse(response))
                response.results = _results;
        }
        return response;
    }
    async queryDatabase(databaseId, filter) {
        return await NotionHandler.makePaginatedRequest(this.databases.query, {
            database_id: databaseId,
            filter,
        });
    }
    async createPage(parameters) {
        return await NotionHandler.makeRequest(this.pages.create, parameters);
    }
}
exports.NotionHandler = NotionHandler;
//# sourceMappingURL=notionHandler.js.map