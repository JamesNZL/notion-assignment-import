import { CanvasClient } from '../apis/canvas';
import { Storage } from '../apis/storage';
import { exportToNotion } from '../popup/import';
import { IFetchedAssignment } from '../popup/fetch';
import moment from 'moment-timezone';

const ALARM_NAME = 'notion-assignment-sync';

// @ts-ignore
browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) {
        await performSync();
    }
});

// @ts-ignore
browser.storage.onChanged.addListener(async (changes) => {
    if (changes['background.syncEnabled'] || changes['background.syncInterval']) {
        await setupAlarm();
    }
});

async function setupAlarm() {
    const options = await Storage.getOptions();
    // @ts-ignore
    await browser.alarms.clear(ALARM_NAME);

    if (options.background.syncEnabled) {
        // @ts-ignore
        browser.alarms.create(ALARM_NAME, {
            periodInMinutes: options.background.syncInterval,
        });
        console.log(`Background sync scheduled every ${options.background.syncInterval} minutes.`);
    }
}

async function performSync() {
    console.log('Background sync starting...');
    const options = await Storage.getOptions();

    if (!options.background.syncEnabled) return;

    // In a real implementation, we'd need the Canvas origin.
    // We'll assume for now we use the one from the last manual scrape or a setting.
    // For simplicity in this demo, we'll look at the saved course list.

    // Extract the Canvas origin from saved assignments
    const savedAssignments = await Storage.getSavedAssignments();
    const firstAssignment = Object.values(savedAssignments).flat()[0];

    if (!firstAssignment?.url) {
        console.warn('No saved assignments found. Cannot determine Canvas origin for background sync.');
        return;
    }

    const origin = new URL(firstAssignment.url).origin;
    const canvasClient = new CanvasClient({ origin, courseId: '' });
    const courses = await canvasClient.fetchCourses();

    if (!courses) {
        console.error('Failed to fetch courses for background sync.');
        return;
    }

    for (const course of courses) {
        console.log(`Syncing course: ${course.name}`);
        // ... fetch assignments and sync ...
    }

    await exportToNotion();
    console.log('Background sync completed.');
}

// Initial setup
setupAlarm();
