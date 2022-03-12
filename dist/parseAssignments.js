"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseAssignments() {
    const classSelector = (className) => `.${className}`;
    const options = await chrome.storage.local.get({
        breadcrumbs: 'ic-app-crumbs',
        courseCodeN: 2,
        canvasAssignment: 'assignment',
        assignmentTitle: 'ig-title',
        availableDate: 'assignment-date-available',
        availableStatus: 'status-description',
        dueDate: 'assignment-date-due',
        dateElement: 'screenreader-only',
        notAvailableStatus: 'Not available until',
    });
    const CONSTANTS = {
        CLASSES: {
            BREADCRUMBS: options.breadcrumbs,
            ASSIGNMENT: options.canvasAssignment,
            TITLE: options.assignmentTitle,
            AVAILABLE_DATE: options.availableDate,
            AVAILABLE_STATUS: options.availableStatus,
            DUE_DATE: options.dueDate,
            SCREENREADER_ONLY: options.dateElement,
        },
        SELECTORS: {
            get COURSE_CODE() { return `${classSelector(CONSTANTS.CLASSES.BREADCRUMBS)} li:nth-of-type(${CONSTANTS.VALUES.COURSE_CODE_N}) span`; },
            get AVAILABLE_STATUS() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.AVAILABLE_STATUS)}`; },
            get AVAILABLE_DATE() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
            get DUE_DATE() { return `${classSelector(CONSTANTS.CLASSES.DUE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
        },
        VALUES: {
            COURSE_CODE_N: options.courseCodeN,
            NOT_AVAILABLE_STATUS: options.notAvailableStatus,
        },
    };
    function verifySelector(assignment, selector) {
        const element = assignment.querySelector(selector);
        return (element)
            ? element
            : alert(`Incorrect selector: ${selector}`);
    }
    function parseCourseCode() {
        return document.querySelector(CONSTANTS.SELECTORS.COURSE_CODE)?.innerHTML ?? 'Unknown Course Code';
    }
    function parseAvailableDate(assignment) {
        const availableStatus = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_STATUS);
        const availableDate = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_DATE);
        // If the AVAILABLE_STATUS class actually contains the 'available until' date, return an empty string
        if (availableStatus?.textContent?.trim() !== CONSTANTS.VALUES.NOT_AVAILABLE_STATUS)
            return '';
        return availableDate?.textContent?.trim() ?? '';
    }
    function parseAssignment(assignment) {
        const assignmentTitle = verifySelector(assignment, classSelector(CONSTANTS.CLASSES.TITLE));
        // Ensure the configured selectors are valid
        if (!assignmentTitle?.textContent || !(assignmentTitle instanceof HTMLAnchorElement))
            return [];
        return [{
                name: assignmentTitle.textContent.trim(),
                course: parseCourseCode(),
                url: assignmentTitle.href,
                available: parseAvailableDate(assignment),
                due: assignment.querySelector(CONSTANTS.SELECTORS.DUE_DATE)?.textContent?.trim() ?? '',
            }];
    }
    const assignments = document.getElementsByClassName(CONSTANTS.CLASSES.ASSIGNMENT);
    const parsedAssignments = Object.values(assignments).flatMap(assignment => parseAssignment(assignment));
    if (parsedAssignments.length) {
        const { savedAssignments } = await chrome.storage.local.get({ savedAssignments: {} });
        savedAssignments[parseCourseCode()] = parsedAssignments;
        chrome.storage.local.set({ savedAssignments });
        return parseCourseCode();
    }
    else
        alert('No Canvas assignments found on this page.\n\nPlease ensure this is a valid Canvas Course Assignments page.\n\nIf this is a valid assignments page, the Canvas Class Names options may be incorrect.');
}
const notionImport = require("./import");
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
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id)
            return;
        const [{ result: courseCode }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: parseAssignments,
        });
        updateSavedCoursesList();
        if (courseCode)
            parseButton.innerHTML = `Saved ${courseCode}!`;
    });
    notionImportButton.addEventListener('click', async () => {
        notionImportButton.innerHTML = 'Importing to Notion...';
        const createdAssignments = await notionImport();
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
//# sourceMappingURL=parseAssignments.js.map