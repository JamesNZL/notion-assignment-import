const parseAssignments = () => {
    const classSelector = (className) => `.${className}`;
    const CONSTANTS = {
        COURSE: '****** ***',
        CLASSES: {
            ASSIGNMENT: 'assignment',
            TITLE: 'ig-title',
            AVAILABLE_DATE: 'assignment-date-available',
            AVAILABLE_STATUS: 'status-description',
            DUE_DATE: 'assignment-date-due',
            SCREENREADER_ONLY: 'screenreader-only',
        },
        SELECTORS: {
            get AVAILABLE_STATUS() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.AVAILABLE_STATUS)}`; },
            get AVAILABLE_DATE() { return `${classSelector(CONSTANTS.CLASSES.AVAILABLE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
            get DUE_DATE() { return `${classSelector(CONSTANTS.CLASSES.DUE_DATE)} ${classSelector(CONSTANTS.CLASSES.SCREENREADER_ONLY)}`; },
        },
        VALUES: {
            NOT_AVAILABLE_STATUS: 'Not available until',
        },
    };
    const verifySelector = (assignment, selector) => {
        const element = assignment.querySelector(selector);
        return (element)
            ? element
            : console.error(`Incorrect selector: ${selector}`);
    };
    const parseAvailableDate = (assignment) => {
        const availableStatus = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_STATUS);
        const availableDate = assignment.querySelector(CONSTANTS.SELECTORS.AVAILABLE_DATE);
        // If the AVAILABLE_STATUS class actually contains the 'available until' date, return an empty string
        if (availableStatus?.textContent?.trim() !== CONSTANTS.VALUES.NOT_AVAILABLE_STATUS)
            return '';
        return availableDate?.textContent?.trim() ?? '';
    };
    const parseAssignment = (assignment) => {
        const assignmentTitle = verifySelector(assignment, classSelector(CONSTANTS.CLASSES.TITLE));
        // Ensure the configured selectors are valid
        if (!assignmentTitle?.textContent || !(assignmentTitle instanceof HTMLAnchorElement))
            return;
        return {
            name: assignmentTitle.textContent.trim(),
            course: CONSTANTS.COURSE,
            url: assignmentTitle.href,
            available: parseAvailableDate(assignment),
            due: assignment.querySelector(CONSTANTS.SELECTORS.DUE_DATE)?.textContent?.trim() ?? '',
        };
    };
    const assignments = document.getElementsByClassName(CONSTANTS.CLASSES.ASSIGNMENT);
    const parsed = Object.values(assignments).map(assignment => parseAssignment(assignment));
    console.log(JSON.stringify(parsed));
};
const parseButton = document.getElementById('parseButton');
if (parseButton) {
    parseButton.addEventListener('click', async () => {
        // @ts-ignore
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        // @ts-ignore
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: parseAssignments,
        });
    });
}
export {};
//# sourceMappingURL=parseAssignments.js.map