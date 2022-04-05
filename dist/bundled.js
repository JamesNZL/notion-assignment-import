(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notionImport_1 = require("./notionImport");
const buttons = {
    optionsButton: document.getElementById('optionsButton'),
    clearStorageButton: document.getElementById('clearStorageButton'),
    viewSavedButton: document.getElementById('viewSavedButton'),
    copySavedButton: document.getElementById('copySavedButton'),
    viewCoursesButton: document.getElementById('viewCoursesButton'),
    parseButton: document.getElementById('parseButton'),
    notionImportButton: document.getElementById('notionImportButton'),
};
if (Object.values(buttons).every(button => button !== null)) {
    const { optionsButton, clearStorageButton, viewSavedButton, copySavedButton, viewCoursesButton, parseButton, notionImportButton, } = buttons;
    optionsButton.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        }
        else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
    clearStorageButton.addEventListener('click', () => {
        chrome.storage.local.remove('savedAssignments');
        updateSavedCoursesList();
    });
    viewSavedButton.addEventListener('click', async () => {
        const savedCourses = document.getElementById('savedCoursesList');
        if (savedCourses) {
            const { savedAssignments } = await chrome.storage.local.get({ savedAssignments: {} });
            savedCourses.innerHTML = `<p><code>${JSON.stringify(savedAssignments)}</code></p>`;
        }
    });
    copySavedButton.addEventListener('click', async () => {
        const { savedAssignments } = await chrome.storage.local.get({ savedAssignments: {} });
        await navigator.clipboard.writeText(JSON.stringify(savedAssignments));
        copySavedButton.innerHTML = 'Copied to clipboard!';
    });
    viewCoursesButton.addEventListener('click', () => updateSavedCoursesList());
    parseButton.addEventListener('click', async () => {
        await chrome.storage.local.remove('savedCourse');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id)
            return;
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['dist/parseAssignments.js'],
        });
        let courseCode = undefined;
        while (courseCode === undefined) {
            ({ savedCourse: courseCode } = await chrome.storage.local.get('savedCourse'));
        }
        updateSavedCoursesList();
        if (courseCode)
            parseButton.innerHTML = `Saved ${courseCode}!`;
    });
    notionImportButton.addEventListener('click', async () => {
        notionImportButton.innerHTML = 'Exporting to Notion...';
        const createdAssignments = await (0, notionImport_1.notionImport)();
        if (createdAssignments) {
            const createdNames = (createdAssignments.length)
                ? createdAssignments.reduce((list, { course, name }, index) => list + `${index + 1}. ${course} ${name}\n`, '\n\n')
                : '';
            notionImportButton.innerHTML = `Imported ${createdAssignments.length} assignments!`;
            alert(`Created ${createdAssignments.length} new assignments.${createdNames}`);
        }
    });
}
async function updateSavedCoursesList() {
    const savedCourses = document.getElementById('savedCoursesList');
    if (savedCourses) {
        const { savedAssignments } = await chrome.storage.local.get({ savedAssignments: {} });
        const coursesList = Object.entries(savedAssignments).reduce((list, [course, assignments]) => list + `<li>${course} (${assignments.length} assignments)</li>\n`, '');
        savedCourses.innerHTML = (coursesList)
            ? `<ol>${coursesList}</ol>`
            : '<p>No saved courses.</p>';
    }
}
updateSavedCoursesList();

},{"./notionImport":3}],2:[function(require,module,exports){
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

},{"@notionhq/client":9}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notionImport = void 0;
const notionHandler_1 = require("./notionHandler");
async function notionImport() {
    const options = await chrome.storage.local.get({
        timezone: 'Pacific/Auckland',
        toDoName: 'Name',
        toDoCategory: 'Category',
        toDoCourse: 'Course',
        toDoURL: 'URL',
        toDoStatus: 'Status',
        toDoAvailable: 'Reminder',
        toDoDue: 'Due',
        toDoSpan: 'Date Span',
        categoryCanvas: 'Canvas',
        statusToDo: 'To Do',
    });
    const CONSTANTS = {
        TIMEZONE: options.timezone,
        PROPERTY_NAMES: {
            TO_DO_NAME: options.toDoName,
            TO_DO_CATEGORY: options.toDoCategory,
            TO_DO_COURSE: options.toDoCourse,
            TO_DO_URL: options.toDoURL,
            TO_DO_STATUS: options.toDoStatus,
            TO_DO_AVAIALBLE: options.toDoAvailable,
            TO_DO_DUE: options.toDoDue,
            TO_DO_SPAN: options.toDoSpan,
        },
        PROPERTY_VALUES: {
            CATEGORY_CANVAS: options.categoryCanvas,
            STATUS_TO_DO: options.statusToDo,
        },
    };
    class SavedAssignment {
        constructor(assignment) {
            this.assignment = assignment;
        }
        get name() {
            return this.assignment.name;
        }
        get course() {
            return this.assignment.course;
        }
        get icon() {
            return this.assignment.icon;
        }
        get url() {
            return this.assignment.url;
        }
        get available() {
            return this.assignment.available;
        }
        get due() {
            return this.assignment.due;
        }
        notionPageParameters(databaseId) {
            return {
                parent: {
                    type: 'database_id',
                    database_id: databaseId,
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: this.name,
                                },
                            },
                        ],
                    },
                    [CONSTANTS.PROPERTY_NAMES.TO_DO_CATEGORY]: {
                        select: {
                            name: CONSTANTS.PROPERTY_VALUES.CATEGORY_CANVAS,
                        },
                    },
                    [CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE]: {
                        select: {
                            name: this.course,
                        },
                    },
                    [CONSTANTS.PROPERTY_NAMES.TO_DO_URL]: {
                        url: this.url,
                    },
                    [CONSTANTS.PROPERTY_NAMES.TO_DO_STATUS]: {
                        select: {
                            name: CONSTANTS.PROPERTY_VALUES.STATUS_TO_DO,
                        },
                    },
                    [CONSTANTS.PROPERTY_NAMES.TO_DO_AVAIALBLE]: {
                        date: {
                            start: this.available,
                            time_zone: CONSTANTS.TIMEZONE,
                        },
                    },
                    [CONSTANTS.PROPERTY_NAMES.TO_DO_DUE]: {
                        date: {
                            start: this.due,
                            time_zone: CONSTANTS.TIMEZONE,
                        },
                    },
                    [CONSTANTS.PROPERTY_NAMES.TO_DO_SPAN]: {
                        date: {
                            start: this.available,
                            end: this.due,
                            time_zone: CONSTANTS.TIMEZONE,
                        },
                    },
                },
                icon: (this.icon)
                    ? {
                        emoji: this.icon,
                    }
                    : null,
            };
        }
    }
    class NotionAssignment {
        constructor(assignment) {
            this.assignment = assignment;
        }
        get name() {
            return ('properties' in this.assignment && 'title' in this.assignment.properties.Name) ? this.assignment.properties.Name.title.map(({ plain_text }) => plain_text).join('') : '';
        }
        get course() {
            if ('properties' in this.assignment && CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE in this.assignment.properties) {
                // Extract the course property from the page
                const courseProperty = this.assignment.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE];
                // If the course property is a select property, return its name
                if ('select' in courseProperty)
                    return courseProperty.select?.name;
            }
            // Return undefined if no select was found
            return undefined;
        }
        get url() {
            if ('properties' in this.assignment && CONSTANTS.PROPERTY_NAMES.TO_DO_URL in this.assignment.properties) {
                const urlProperty = this.assignment.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_URL];
                if ('url' in urlProperty && urlProperty?.url)
                    return urlProperty.url;
            }
            return undefined;
        }
    }
    async function getNewAssignments(databaseId) {
        async function getSavedAssignments() {
            const { savedAssignments } = await chrome.storage.local.get({ savedAssignments: {} });
            return Object.values(savedAssignments)
                .flat()
                .map(assignment => new SavedAssignment(assignment));
        }
        async function queryNotionAssignments() {
            const filterForCanvasAssignments = {
                property: CONSTANTS.PROPERTY_NAMES.TO_DO_CATEGORY,
                select: {
                    equals: CONSTANTS.PROPERTY_VALUES.CATEGORY_CANVAS,
                },
            };
            const notionAssignments = await notionHandler.queryDatabase(databaseId, filterForCanvasAssignments);
            return notionAssignments?.results?.map(assignment => new NotionAssignment(assignment));
        }
        const savedAssignments = await getSavedAssignments();
        const notionAssignments = await queryNotionAssignments();
        if (!notionAssignments?.length)
            return savedAssignments;
        return savedAssignments.filter(assignment => !notionAssignments.some(page => page.url === assignment.url));
    }
    // Set up Notion API handler
    const { notionKey: NOTION_KEY, databaseId: TO_DO_ID } = await chrome.storage.local.get(['notionKey', 'databaseId']);
    if (!NOTION_KEY || !TO_DO_ID)
        return alert('Invalid Notion Environment Variables.');
    const notionHandler = new notionHandler_1.NotionHandler({ auth: NOTION_KEY });
    // Create assignments
    const assignments = await getNewAssignments(TO_DO_ID);
    let errorCount = 0;
    const createdAssignments = await Promise.all(assignments.map(async (assignment) => {
        const page = await notionHandler.createPage(assignment.notionPageParameters(TO_DO_ID));
        if (page) {
            console.log(`Created assignment ${assignment.course} ${assignment.name}`);
            return [assignment];
        }
        else {
            console.error(`Error creating assignment ${assignment.course} ${assignment.name}`);
            errorCount++;
            return [];
        }
    }));
    if (errorCount)
        alert(`An error was encountered when creating ${errorCount} assignments.`);
    return createdAssignments.flat();
}
exports.notionImport = notionImport;

},{"./notionHandler":2}],4:[function(require,module,exports){
module.exports={
    "name": "@notionhq/client",
    "version": "0.4.13",
    "description": "A simple and easy to use client for the Notion API",
    "engines": {
        "node": ">=12"
    },
    "homepage": "https://developers.notion.com/docs/getting-started",
    "bugs": {
        "url": "https://github.com/makenotion/notion-sdk-js/issues"
    },
    "repository": {
        "type": "git",
        "url": "https://github.com/makenotion/notion-sdk-js/"
    },
    "keywords": [
        "notion",
        "notionapi",
        "rest",
        "notion-api"
    ],
    "main": "./build/src",
    "scripts": {
        "prepare": "npm run build",
        "prepublishOnly": "npm run checkLoggedIn && npm run lint && npm run test",
        "build": "tsc",
        "prettier": "prettier --write .",
        "lint": "prettier --check . && eslint . --ext .ts && cspell '**/*' ",
        "test": "ava",
        "check-links": "git ls-files | grep md$ | xargs -n 1 markdown-link-check",
        "prebuild": "npm run clean",
        "clean": "rm -rf ./build",
        "checkLoggedIn": "./scripts/verifyLoggedIn.sh"
    },
    "author": "",
    "license": "MIT",
    "files": [
        "build/package.json",
        "build/src/**"
    ],
    "dependencies": {
        "@types/node-fetch": "^2.5.10",
        "node-fetch": "^2.6.1"
    },
    "devDependencies": {
        "@ava/typescript": "^2.0.0",
        "@typescript-eslint/eslint-plugin": "^4.22.0",
        "@typescript-eslint/parser": "^4.22.0",
        "ava": "^3.15.0",
        "cspell": "^5.4.1",
        "eslint": "^7.24.0",
        "markdown-link-check": "^3.8.7",
        "prettier": "^2.3.0",
        "typescript": "^4.2.4"
    }
}

},{}],5:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Client_auth, _Client_logLevel, _Client_logger, _Client_prefixUrl, _Client_timeoutMs, _Client_notionVersion, _Client_fetch, _Client_agent, _Client_userAgent;
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("./logging");
const errors_1 = require("./errors");
const helpers_1 = require("./helpers");
const api_endpoints_1 = require("./api-endpoints");
const node_fetch_1 = require("node-fetch");
const package_json_1 = require("../package.json");
class Client {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f;
        _Client_auth.set(this, void 0);
        _Client_logLevel.set(this, void 0);
        _Client_logger.set(this, void 0);
        _Client_prefixUrl.set(this, void 0);
        _Client_timeoutMs.set(this, void 0);
        _Client_notionVersion.set(this, void 0);
        _Client_fetch.set(this, void 0);
        _Client_agent.set(this, void 0);
        _Client_userAgent.set(this, void 0);
        /*
         * Notion API endpoints
         */
        this.blocks = {
            /**
             * Retrieve block
             */
            retrieve: (args) => {
                return this.request({
                    path: api_endpoints_1.getBlock.path(args),
                    method: api_endpoints_1.getBlock.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.getBlock.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.getBlock.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Update block
             */
            update: (args) => {
                return this.request({
                    path: api_endpoints_1.updateBlock.path(args),
                    method: api_endpoints_1.updateBlock.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.updateBlock.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.updateBlock.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Delete block
             */
            delete: (args) => {
                return this.request({
                    path: api_endpoints_1.deleteBlock.path(args),
                    method: api_endpoints_1.deleteBlock.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.deleteBlock.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.deleteBlock.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            children: {
                /**
                 * Append block children
                 */
                append: (args) => {
                    return this.request({
                        path: api_endpoints_1.appendBlockChildren.path(args),
                        method: api_endpoints_1.appendBlockChildren.method,
                        query: (0, helpers_1.pick)(args, api_endpoints_1.appendBlockChildren.queryParams),
                        body: (0, helpers_1.pick)(args, api_endpoints_1.appendBlockChildren.bodyParams),
                        auth: args === null || args === void 0 ? void 0 : args.auth,
                    });
                },
                /**
                 * Retrieve block children
                 */
                list: (args) => {
                    return this.request({
                        path: api_endpoints_1.listBlockChildren.path(args),
                        method: api_endpoints_1.listBlockChildren.method,
                        query: (0, helpers_1.pick)(args, api_endpoints_1.listBlockChildren.queryParams),
                        body: (0, helpers_1.pick)(args, api_endpoints_1.listBlockChildren.bodyParams),
                        auth: args === null || args === void 0 ? void 0 : args.auth,
                    });
                },
            },
        };
        this.databases = {
            /**
             * List databases
             *
             * @deprecated Please use `search`
             */
            list: (args) => {
                return this.request({
                    path: api_endpoints_1.listDatabases.path(),
                    method: api_endpoints_1.listDatabases.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.listDatabases.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.listDatabases.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Retrieve a database
             */
            retrieve: (args) => {
                return this.request({
                    path: api_endpoints_1.getDatabase.path(args),
                    method: api_endpoints_1.getDatabase.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.getDatabase.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.getDatabase.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Query a database
             */
            query: (args) => {
                return this.request({
                    path: api_endpoints_1.queryDatabase.path(args),
                    method: api_endpoints_1.queryDatabase.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.queryDatabase.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.queryDatabase.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Create a database
             */
            create: (args) => {
                return this.request({
                    path: api_endpoints_1.createDatabase.path(),
                    method: api_endpoints_1.createDatabase.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.createDatabase.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.createDatabase.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Update a database
             */
            update: (args) => {
                return this.request({
                    path: api_endpoints_1.updateDatabase.path(args),
                    method: api_endpoints_1.updateDatabase.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.updateDatabase.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.updateDatabase.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
        };
        this.pages = {
            /**
             * Create a page
             */
            create: (args) => {
                return this.request({
                    path: api_endpoints_1.createPage.path(),
                    method: api_endpoints_1.createPage.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.createPage.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.createPage.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Retrieve a page
             */
            retrieve: (args) => {
                return this.request({
                    path: api_endpoints_1.getPage.path(args),
                    method: api_endpoints_1.getPage.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.getPage.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.getPage.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Update page properties
             */
            update: (args) => {
                return this.request({
                    path: api_endpoints_1.updatePage.path(args),
                    method: api_endpoints_1.updatePage.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.updatePage.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.updatePage.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            properties: {
                /**
                 * Retrieve page property
                 */
                retrieve: (args) => {
                    return this.request({
                        path: api_endpoints_1.getPageProperty.path(args),
                        method: api_endpoints_1.getPageProperty.method,
                        query: (0, helpers_1.pick)(args, api_endpoints_1.getPageProperty.queryParams),
                        body: (0, helpers_1.pick)(args, api_endpoints_1.getPageProperty.bodyParams),
                        auth: args === null || args === void 0 ? void 0 : args.auth,
                    });
                },
            },
        };
        this.users = {
            /**
             * Retrieve a user
             */
            retrieve: (args) => {
                return this.request({
                    path: api_endpoints_1.getUser.path(args),
                    method: api_endpoints_1.getUser.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.getUser.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.getUser.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * List all users
             */
            list: (args) => {
                return this.request({
                    path: api_endpoints_1.listUsers.path(),
                    method: api_endpoints_1.listUsers.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.listUsers.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.listUsers.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
            /**
             * Get details about bot
             */
            me: (args) => {
                return this.request({
                    path: api_endpoints_1.getSelf.path(),
                    method: api_endpoints_1.getSelf.method,
                    query: (0, helpers_1.pick)(args, api_endpoints_1.getSelf.queryParams),
                    body: (0, helpers_1.pick)(args, api_endpoints_1.getSelf.bodyParams),
                    auth: args === null || args === void 0 ? void 0 : args.auth,
                });
            },
        };
        __classPrivateFieldSet(this, _Client_auth, options === null || options === void 0 ? void 0 : options.auth, "f");
        __classPrivateFieldSet(this, _Client_logLevel, (_a = options === null || options === void 0 ? void 0 : options.logLevel) !== null && _a !== void 0 ? _a : logging_1.LogLevel.WARN, "f");
        __classPrivateFieldSet(this, _Client_logger, (_b = options === null || options === void 0 ? void 0 : options.logger) !== null && _b !== void 0 ? _b : (0, logging_1.makeConsoleLogger)(package_json_1.name), "f");
        __classPrivateFieldSet(this, _Client_prefixUrl, ((_c = options === null || options === void 0 ? void 0 : options.baseUrl) !== null && _c !== void 0 ? _c : "https://api.notion.com") + "/v1/", "f");
        __classPrivateFieldSet(this, _Client_timeoutMs, (_d = options === null || options === void 0 ? void 0 : options.timeoutMs) !== null && _d !== void 0 ? _d : 60000, "f");
        __classPrivateFieldSet(this, _Client_notionVersion, (_e = options === null || options === void 0 ? void 0 : options.notionVersion) !== null && _e !== void 0 ? _e : Client.defaultNotionVersion, "f");
        __classPrivateFieldSet(this, _Client_fetch, (_f = options === null || options === void 0 ? void 0 : options.fetch) !== null && _f !== void 0 ? _f : node_fetch_1.default, "f");
        __classPrivateFieldSet(this, _Client_agent, options === null || options === void 0 ? void 0 : options.agent, "f");
        __classPrivateFieldSet(this, _Client_userAgent, `notionhq-client/${package_json_1.version}`, "f");
    }
    /**
     * Sends a request.
     *
     * @param path
     * @param method
     * @param query
     * @param body
     * @returns
     */
    async request({ path, method, query, body, auth, }) {
        this.log(logging_1.LogLevel.INFO, "request start", { method, path });
        // If the body is empty, don't send the body in the HTTP request
        const bodyAsJsonString = !body || Object.entries(body).length === 0
            ? undefined
            : JSON.stringify(body);
        const url = new URL(`${__classPrivateFieldGet(this, _Client_prefixUrl, "f")}${path}`);
        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            }
        }
        const headers = {
            ...this.authAsHeaders(auth),
            "Notion-Version": __classPrivateFieldGet(this, _Client_notionVersion, "f"),
            "user-agent": __classPrivateFieldGet(this, _Client_userAgent, "f"),
        };
        if (bodyAsJsonString !== undefined) {
            headers["content-type"] = "application/json";
        }
        try {
            const response = await errors_1.RequestTimeoutError.rejectAfterTimeout(__classPrivateFieldGet(this, _Client_fetch, "f").call(this, url.toString(), {
                method,
                headers,
                body: bodyAsJsonString,
                agent: __classPrivateFieldGet(this, _Client_agent, "f"),
            }), __classPrivateFieldGet(this, _Client_timeoutMs, "f"));
            const responseText = await response.text();
            if (!response.ok) {
                throw (0, errors_1.buildRequestError)(response, responseText);
            }
            const responseJson = JSON.parse(responseText);
            this.log(logging_1.LogLevel.INFO, `request success`, { method, path });
            return responseJson;
        }
        catch (error) {
            if (!(0, errors_1.isNotionClientError)(error)) {
                throw error;
            }
            // Log the error if it's one of our known error types
            this.log(logging_1.LogLevel.WARN, `request fail`, {
                code: error.code,
                message: error.message,
            });
            if ((0, errors_1.isHTTPResponseError)(error)) {
                // The response body may contain sensitive information so it is logged separately at the DEBUG level
                this.log(logging_1.LogLevel.DEBUG, `failed response body`, {
                    body: error.body,
                });
            }
            throw error;
        }
    }
    /**
     * Search
     */
    search(args) {
        return this.request({
            path: api_endpoints_1.search.path(),
            method: api_endpoints_1.search.method,
            query: (0, helpers_1.pick)(args, api_endpoints_1.search.queryParams),
            body: (0, helpers_1.pick)(args, api_endpoints_1.search.bodyParams),
            auth: args === null || args === void 0 ? void 0 : args.auth,
        });
    }
    /**
     * Emits a log message to the console.
     *
     * @param level The level for this message
     * @param args Arguments to send to the console
     */
    log(level, message, extraInfo) {
        if ((0, logging_1.logLevelSeverity)(level) >= (0, logging_1.logLevelSeverity)(__classPrivateFieldGet(this, _Client_logLevel, "f"))) {
            __classPrivateFieldGet(this, _Client_logger, "f").call(this, level, message, extraInfo);
        }
    }
    /**
     * Transforms an API key or access token into a headers object suitable for an HTTP request.
     *
     * This method uses the instance's value as the default when the input is undefined. If neither are defined, it returns
     * an empty object
     *
     * @param auth API key or access token
     * @returns headers key-value object
     */
    authAsHeaders(auth) {
        const headers = {};
        const authHeaderValue = auth !== null && auth !== void 0 ? auth : __classPrivateFieldGet(this, _Client_auth, "f");
        if (authHeaderValue !== undefined) {
            headers["authorization"] = `Bearer ${authHeaderValue}`;
        }
        return headers;
    }
}
exports.default = Client;
_Client_auth = new WeakMap(), _Client_logLevel = new WeakMap(), _Client_logger = new WeakMap(), _Client_prefixUrl = new WeakMap(), _Client_timeoutMs = new WeakMap(), _Client_notionVersion = new WeakMap(), _Client_fetch = new WeakMap(), _Client_agent = new WeakMap(), _Client_userAgent = new WeakMap();
Client.defaultNotionVersion = "2021-08-16";

},{"../package.json":4,"./api-endpoints":6,"./errors":7,"./helpers":8,"./logging":10,"node-fetch":11}],6:[function(require,module,exports){
"use strict";
// cspell:disable-file
// Note: This is a generated file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.createDatabase = exports.listDatabases = exports.queryDatabase = exports.updateDatabase = exports.getDatabase = exports.appendBlockChildren = exports.listBlockChildren = exports.deleteBlock = exports.updateBlock = exports.getBlock = exports.getPageProperty = exports.updatePage = exports.getPage = exports.createPage = exports.listUsers = exports.getUser = exports.getSelf = void 0;
exports.getSelf = {
    method: "get",
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    path: () => `users/me`,
};
exports.getUser = {
    method: "get",
    pathParams: ["user_id"],
    queryParams: [],
    bodyParams: [],
    path: (p) => `users/${p.user_id}`,
};
exports.listUsers = {
    method: "get",
    pathParams: [],
    queryParams: ["start_cursor", "page_size"],
    bodyParams: [],
    path: () => `users`,
};
exports.createPage = {
    method: "post",
    pathParams: [],
    queryParams: [],
    bodyParams: ["parent", "properties", "icon", "cover", "content", "children"],
    path: () => `pages`,
};
exports.getPage = {
    method: "get",
    pathParams: ["page_id"],
    queryParams: [],
    bodyParams: [],
    path: (p) => `pages/${p.page_id}`,
};
exports.updatePage = {
    method: "patch",
    pathParams: ["page_id"],
    queryParams: [],
    bodyParams: ["properties", "icon", "cover", "archived"],
    path: (p) => `pages/${p.page_id}`,
};
exports.getPageProperty = {
    method: "get",
    pathParams: ["page_id", "property_id"],
    queryParams: ["start_cursor", "page_size"],
    bodyParams: [],
    path: (p) => `pages/${p.page_id}/properties/${p.property_id}`,
};
exports.getBlock = {
    method: "get",
    pathParams: ["block_id"],
    queryParams: [],
    bodyParams: [],
    path: (p) => `blocks/${p.block_id}`,
};
exports.updateBlock = {
    method: "patch",
    pathParams: ["block_id"],
    queryParams: [],
    bodyParams: [
        "embed",
        "type",
        "archived",
        "bookmark",
        "image",
        "video",
        "pdf",
        "file",
        "audio",
        "code",
        "equation",
        "divider",
        "breadcrumb",
        "table_of_contents",
        "link_to_page",
        "table_row",
        "heading_1",
        "heading_2",
        "heading_3",
        "paragraph",
        "bulleted_list_item",
        "numbered_list_item",
        "quote",
        "to_do",
        "toggle",
        "template",
        "callout",
        "synced_block",
        "table",
    ],
    path: (p) => `blocks/${p.block_id}`,
};
exports.deleteBlock = {
    method: "delete",
    pathParams: ["block_id"],
    queryParams: [],
    bodyParams: [],
    path: (p) => `blocks/${p.block_id}`,
};
exports.listBlockChildren = {
    method: "get",
    pathParams: ["block_id"],
    queryParams: ["start_cursor", "page_size"],
    bodyParams: [],
    path: (p) => `blocks/${p.block_id}/children`,
};
exports.appendBlockChildren = {
    method: "patch",
    pathParams: ["block_id"],
    queryParams: [],
    bodyParams: ["children"],
    path: (p) => `blocks/${p.block_id}/children`,
};
exports.getDatabase = {
    method: "get",
    pathParams: ["database_id"],
    queryParams: [],
    bodyParams: [],
    path: (p) => `databases/${p.database_id}`,
};
exports.updateDatabase = {
    method: "patch",
    pathParams: ["database_id"],
    queryParams: [],
    bodyParams: ["title", "icon", "cover", "properties"],
    path: (p) => `databases/${p.database_id}`,
};
exports.queryDatabase = {
    method: "post",
    pathParams: ["database_id"],
    queryParams: [],
    bodyParams: ["sorts", "filter", "start_cursor", "page_size", "archived"],
    path: (p) => `databases/${p.database_id}/query`,
};
exports.listDatabases = {
    method: "get",
    pathParams: [],
    queryParams: ["start_cursor", "page_size"],
    bodyParams: [],
    path: () => `databases`,
};
exports.createDatabase = {
    method: "post",
    pathParams: [],
    queryParams: [],
    bodyParams: ["parent", "properties", "icon", "cover", "title"],
    path: () => `databases`,
};
exports.search = {
    method: "post",
    pathParams: [],
    queryParams: [],
    bodyParams: ["sort", "query", "start_cursor", "page_size", "filter"],
    path: () => `search`,
};

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRequestError = exports.APIResponseError = exports.UnknownHTTPResponseError = exports.isHTTPResponseError = exports.RequestTimeoutError = exports.isNotionClientError = exports.ClientErrorCode = exports.APIErrorCode = void 0;
const helpers_1 = require("./helpers");
/**
 * Error codes returned in responses from the API.
 */
var APIErrorCode;
(function (APIErrorCode) {
    APIErrorCode["Unauthorized"] = "unauthorized";
    APIErrorCode["RestrictedResource"] = "restricted_resource";
    APIErrorCode["ObjectNotFound"] = "object_not_found";
    APIErrorCode["RateLimited"] = "rate_limited";
    APIErrorCode["InvalidJSON"] = "invalid_json";
    APIErrorCode["InvalidRequestURL"] = "invalid_request_url";
    APIErrorCode["InvalidRequest"] = "invalid_request";
    APIErrorCode["ValidationError"] = "validation_error";
    APIErrorCode["ConflictError"] = "conflict_error";
    APIErrorCode["InternalServerError"] = "internal_server_error";
    APIErrorCode["ServiceUnavailable"] = "service_unavailable";
})(APIErrorCode = exports.APIErrorCode || (exports.APIErrorCode = {}));
/**
 * Error codes generated for client errors.
 */
var ClientErrorCode;
(function (ClientErrorCode) {
    ClientErrorCode["RequestTimeout"] = "notionhq_client_request_timeout";
    ClientErrorCode["ResponseError"] = "notionhq_client_response_error";
})(ClientErrorCode = exports.ClientErrorCode || (exports.ClientErrorCode = {}));
/**
 * Base error type.
 */
class NotionClientErrorBase extends Error {
}
/**
 * @param error any value, usually a caught error.
 * @returns `true` if error is a `NotionClientError`.
 */
function isNotionClientError(error) {
    return (0, helpers_1.isObject)(error) && error instanceof NotionClientErrorBase;
}
exports.isNotionClientError = isNotionClientError;
/**
 * Narrows down the types of a NotionClientError.
 * @param error any value, usually a caught error.
 * @param codes an object mapping from possible error codes to `true`
 * @returns `true` if error is a `NotionClientError` with a code in `codes`.
 */
function isNotionClientErrorWithCode(error, codes) {
    return isNotionClientError(error) && error.code in codes;
}
/**
 * Error thrown by the client if a request times out.
 */
class RequestTimeoutError extends NotionClientErrorBase {
    constructor(message = "Request to Notion API has timed out") {
        super(message);
        this.code = ClientErrorCode.RequestTimeout;
        this.name = "RequestTimeoutError";
    }
    static isRequestTimeoutError(error) {
        return isNotionClientErrorWithCode(error, {
            [ClientErrorCode.RequestTimeout]: true,
        });
    }
    static rejectAfterTimeout(promise, timeoutMS) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new RequestTimeoutError());
            }, timeoutMS);
            promise
                .then(resolve)
                .catch(reject)
                .then(() => clearTimeout(timeoutId));
        });
    }
}
exports.RequestTimeoutError = RequestTimeoutError;
class HTTPResponseError extends NotionClientErrorBase {
    constructor(args) {
        super(args.message);
        this.name = "HTTPResponseError";
        const { code, status, headers, rawBodyText } = args;
        this.code = code;
        this.status = status;
        this.headers = headers;
        this.body = rawBodyText;
    }
}
const httpResponseErrorCodes = {
    [ClientErrorCode.ResponseError]: true,
    [APIErrorCode.Unauthorized]: true,
    [APIErrorCode.RestrictedResource]: true,
    [APIErrorCode.ObjectNotFound]: true,
    [APIErrorCode.RateLimited]: true,
    [APIErrorCode.InvalidJSON]: true,
    [APIErrorCode.InvalidRequestURL]: true,
    [APIErrorCode.InvalidRequest]: true,
    [APIErrorCode.ValidationError]: true,
    [APIErrorCode.ConflictError]: true,
    [APIErrorCode.InternalServerError]: true,
    [APIErrorCode.ServiceUnavailable]: true,
};
function isHTTPResponseError(error) {
    if (!isNotionClientErrorWithCode(error, httpResponseErrorCodes)) {
        return false;
    }
    return true;
}
exports.isHTTPResponseError = isHTTPResponseError;
/**
 * Error thrown if an API call responds with an unknown error code, or does not respond with
 * a property-formatted error.
 */
class UnknownHTTPResponseError extends HTTPResponseError {
    constructor(args) {
        var _a;
        super({
            ...args,
            code: ClientErrorCode.ResponseError,
            message: (_a = args.message) !== null && _a !== void 0 ? _a : `Request to Notion API failed with status: ${args.status}`,
        });
        this.name = "UnknownHTTPResponseError";
    }
    static isUnknownHTTPResponseError(error) {
        return isNotionClientErrorWithCode(error, {
            [ClientErrorCode.ResponseError]: true,
        });
    }
}
exports.UnknownHTTPResponseError = UnknownHTTPResponseError;
const apiErrorCodes = {
    [APIErrorCode.Unauthorized]: true,
    [APIErrorCode.RestrictedResource]: true,
    [APIErrorCode.ObjectNotFound]: true,
    [APIErrorCode.RateLimited]: true,
    [APIErrorCode.InvalidJSON]: true,
    [APIErrorCode.InvalidRequestURL]: true,
    [APIErrorCode.InvalidRequest]: true,
    [APIErrorCode.ValidationError]: true,
    [APIErrorCode.ConflictError]: true,
    [APIErrorCode.InternalServerError]: true,
    [APIErrorCode.ServiceUnavailable]: true,
};
/**
 * A response from the API indicating a problem.
 * Use the `code` property to handle various kinds of errors. All its possible values are in `APIErrorCode`.
 */
class APIResponseError extends HTTPResponseError {
    constructor() {
        super(...arguments);
        this.name = "APIResponseError";
    }
    static isAPIResponseError(error) {
        return isNotionClientErrorWithCode(error, apiErrorCodes);
    }
}
exports.APIResponseError = APIResponseError;
function buildRequestError(response, bodyText) {
    const apiErrorResponseBody = parseAPIErrorResponseBody(bodyText);
    if (apiErrorResponseBody !== undefined) {
        return new APIResponseError({
            code: apiErrorResponseBody.code,
            message: apiErrorResponseBody.message,
            headers: response.headers,
            status: response.status,
            rawBodyText: bodyText,
        });
    }
    return new UnknownHTTPResponseError({
        message: undefined,
        headers: response.headers,
        status: response.status,
        rawBodyText: bodyText,
    });
}
exports.buildRequestError = buildRequestError;
function parseAPIErrorResponseBody(body) {
    if (typeof body !== "string") {
        return;
    }
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch (parseError) {
        return;
    }
    if (!(0, helpers_1.isObject)(parsed) ||
        typeof parsed["message"] !== "string" ||
        !isAPIErrorCode(parsed["code"])) {
        return;
    }
    return {
        ...parsed,
        code: parsed["code"],
        message: parsed["message"],
    };
}
function isAPIErrorCode(code) {
    return typeof code === "string" && code in apiErrorCodes;
}

},{"./helpers":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = exports.pick = exports.assertNever = void 0;
/**
 * Utility for enforcing exhaustiveness checks in the type system.
 *
 * @see https://basarat.gitbook.io/typescript/type-system/discriminated-unions#throw-in-exhaustive-checks
 *
 * @param value The variable with no remaining values
 */
function assertNever(value) {
    throw new Error(`Unexpected value should never occur: ${value}`);
}
exports.assertNever = assertNever;
function pick(base, keys) {
    const entries = keys.map(key => [key, base === null || base === void 0 ? void 0 : base[key]]);
    return Object.fromEntries(entries);
}
exports.pick = pick;
function isObject(o) {
    return typeof o === "object" && o !== null;
}
exports.isObject = isObject;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotionClientError = exports.RequestTimeoutError = exports.UnknownHTTPResponseError = exports.APIResponseError = exports.ClientErrorCode = exports.APIErrorCode = exports.LogLevel = exports.Client = void 0;
var Client_1 = require("./Client");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return Client_1.default; } });
var logging_1 = require("./logging");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logging_1.LogLevel; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "APIErrorCode", { enumerable: true, get: function () { return errors_1.APIErrorCode; } });
Object.defineProperty(exports, "ClientErrorCode", { enumerable: true, get: function () { return errors_1.ClientErrorCode; } });
Object.defineProperty(exports, "APIResponseError", { enumerable: true, get: function () { return errors_1.APIResponseError; } });
Object.defineProperty(exports, "UnknownHTTPResponseError", { enumerable: true, get: function () { return errors_1.UnknownHTTPResponseError; } });
Object.defineProperty(exports, "RequestTimeoutError", { enumerable: true, get: function () { return errors_1.RequestTimeoutError; } });
// Error helpers
Object.defineProperty(exports, "isNotionClientError", { enumerable: true, get: function () { return errors_1.isNotionClientError; } });

},{"./Client":5,"./errors":7,"./logging":10}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLevelSeverity = exports.makeConsoleLogger = exports.LogLevel = void 0;
const helpers_1 = require("./helpers");
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
function makeConsoleLogger(name) {
    return (level, message, extraInfo) => {
        console[level](`${name} ${level}:`, message, extraInfo);
    };
}
exports.makeConsoleLogger = makeConsoleLogger;
/**
 * Transforms a log level into a comparable (numerical) value ordered by severity.
 */
function logLevelSeverity(level) {
    switch (level) {
        case LogLevel.DEBUG:
            return 20;
        case LogLevel.INFO:
            return 40;
        case LogLevel.WARN:
            return 60;
        case LogLevel.ERROR:
            return 80;
        default:
            return (0, helpers_1.assertNever)(level);
    }
}
exports.logLevelSeverity = logLevelSeverity;

},{"./helpers":8}],11:[function(require,module,exports){
(function (global){(function (){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports.default = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
