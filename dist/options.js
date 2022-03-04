"use strict";
async function saveOptions() {
    const colour = document.getElementById('colour')?.value;
    const likesColor = document.getElementById('like')?.checked;
    await chrome.storage.sync.set({
        favoriteColor: colour,
        likesColor: likesColor,
    });
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    if (status) {
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    }
}
async function restoreOptions() {
    // Use default value colour = 'red' and likesColor = true.
    const items = await chrome.storage.sync.get({
        favoriteColor: 'red',
        likesColor: true,
    });
    document.getElementById('colour').value = items.favoriteColor;
    document.getElementById('like').checked = items.likesColor;
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
//# sourceMappingURL=options.js.map