"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@notionhq/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fs = require("fs");
const chrono = __importStar(require("chrono-node"));
const CONSTANTS = {
    LOCALE: 'en-GB',
    TIMEZONE: 'Pacific/Auckland',
    PROPERTY_NAMES: {
        TO_DO_NAME: 'Name',
        TO_DO_CATEGORY: 'Category',
        TO_DO_COURSE: 'Course',
        TO_DO_URL: 'URL',
        TO_DO_STATUS: 'Status',
        TO_DO_AVAIALBLE: 'Reminder',
        TO_DO_DUE: 'Due',
        TO_DO_SPAN: 'Date Span',
    },
    PROPERTY_VALUES: {
        CATEGORY_CANVAS: 'Canvas',
        STATUS_TO_DO: 'To Do',
    },
};
const notion = new client_1.Client({ auth: process.env.NOTION_KEY });
function handleError(error) {
    const type = ((0, client_1.isNotionClientError)(error)) ? 'NOTION_ERROR' : 'UNKNOWN_ERROR';
    console.error({ type, error });
}
async function queryDatabase(databaseId, filter) {
    try {
        return await notion.databases.query({ database_id: databaseId, filter });
    }
    catch (error) {
        handleError(error);
    }
}
async function createPage(parameters) {
    try {
        return await notion.pages.create(parameters);
    }
    catch (error) {
        handleError(error);
    }
}
function resolveAssignmentName(page) {
    return ('properties' in page && 'title' in page.properties.Name) ? page.properties.Name.title.map(({ plain_text }) => plain_text).join('') : '';
}
function getAssignmentCourse(page) {
    if ('properties' in page && CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE in page.properties) {
        // Extract the course property from the page
        const courseProperty = page.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_COURSE];
        // If the course property is a select property, return its name
        if ('select' in courseProperty)
            return courseProperty.select?.name;
    }
    // Return undefined if no select was found
    return undefined;
}
function getAssignmentURL(page) {
    if ('properties' in page && CONSTANTS.PROPERTY_NAMES.TO_DO_URL in page.properties) {
        const urlProperty = page.properties[CONSTANTS.PROPERTY_NAMES.TO_DO_URL];
        if ('url' in urlProperty && urlProperty?.url)
            return urlProperty.url;
    }
    return undefined;
}
async function createAssignment(assignment, databaseId) {
    if (databaseId) {
        // Construct the parent object for the CreatePageParameters
        const parent = {
            type: 'database_id',
            database_id: databaseId,
        };
        // Construct the properties object
        // @ts-ignore
        const properties = {
            Name: {
                title: [
                    {
                        text: {
                            content: assignment.name,
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
                    name: assignment.course,
                },
            },
            [CONSTANTS.PROPERTY_NAMES.TO_DO_URL]: {
                url: assignment.url,
            },
            [CONSTANTS.PROPERTY_NAMES.TO_DO_STATUS]: {
                select: {
                    name: CONSTANTS.PROPERTY_VALUES.STATUS_TO_DO,
                },
            },
            [CONSTANTS.PROPERTY_NAMES.TO_DO_AVAIALBLE]: {
                date: {
                    start: assignment.available,
                    time_zone: CONSTANTS.TIMEZONE,
                },
            },
            [CONSTANTS.PROPERTY_NAMES.TO_DO_DUE]: {
                date: {
                    start: assignment.due,
                    time_zone: CONSTANTS.TIMEZONE,
                },
            },
            [CONSTANTS.PROPERTY_NAMES.TO_DO_SPAN]: {
                date: {
                    start: assignment.available,
                    end: assignment.due,
                    time_zone: CONSTANTS.TIMEZONE,
                },
            },
        };
        // Create the page
        // @ts-ignore
        return await createPage({ parent, properties });
    }
}
function readInputFile(filepath) {
    if (!filepath || !fs.existsSync(filepath)) {
        console.error('Invalid input filepath!');
        process.exit(1);
    }
    else {
        const input = JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' }));
        return input
            .flat()
            .flatMap(assignment => {
            if (!assignment.available)
                assignment.available = new Date().toLocaleString(CONSTANTS.LOCALE);
            if (!assignment.due) {
                console.error(`Skipping assignment ${assignment.course} ${assignment.name} as no due date`);
                return [];
            }
            return [{
                    name: assignment.name,
                    course: assignment.course,
                    url: assignment.url,
                    available: chrono.parseDate(assignment.available, { timezone: CONSTANTS.TIMEZONE }).toISOString(),
                    due: chrono.parseDate(assignment.due, { timezone: CONSTANTS.TIMEZONE }).toISOString(),
                }];
        });
    }
}
async function findExistingAssignments(databaseId) {
    if (databaseId) {
        const filterForCanvasAssignments = {
            property: CONSTANTS.PROPERTY_NAMES.TO_DO_CATEGORY,
            select: {
                equals: CONSTANTS.PROPERTY_VALUES.CATEGORY_CANVAS,
            },
        };
        return await queryDatabase(databaseId, filterForCanvasAssignments);
    }
}
async function findNewAssignments(inputFilepath, databaseId) {
    const input = readInputFile(inputFilepath);
    const existingAssignments = await findExistingAssignments(databaseId);
    if (!existingAssignments || !existingAssignments.results.length)
        return input;
    return input.filter(assignment => !existingAssignments.results.some(page => getAssignmentURL(page) === assignment.url));
}
findNewAssignments(process.env.INPUT_FILEPATH, process.env.TO_DO_ID)
    .then(assignments => {
    assignments.forEach(async (assignment) => {
        const page = await createAssignment(assignment, process.env.TO_DO_ID);
        if (page)
            console.log(`Created assignment ${assignment.course} ${assignment.name}`);
        else
            console.error(`Error creating assignment ${assignment.course} ${assignment.name}`);
    });
});
//# sourceMappingURL=index.js.map