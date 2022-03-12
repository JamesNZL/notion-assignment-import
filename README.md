# Usage

1. Install the extension.
   > The extension is currently submitted and awaiting review in the Chrome Web Store — follow [Installation](#installation) for temporary installation instructions

2. Duplicate [this Notion database template](https://jamesnzl-sandbox.notion.site/c4d73bebd39c4103b96b2edb8be9e0bd?v=9afaf4b4faee4a5a977c00291be06c9e).

3. Click `Configure Options` to configure the extension.
   1. Create a new Notion Internal Integration, and add it to the duplicated database.
		> Follow step 1–2 on [this page](https://developers.notion.com/docs/getting-started#step-1-create-an-integration).
      1. Copy and paste your integration key into the `Notion Integration Key` option field.
      2. Copy and paste your database identifier into the `Notion Database ID` option field.

4. Configure the `Timezone` and `Notion Database Properties` if necessary.
	> You should only change the `Canvas Class Names` options if the extension is not parsing assignments correctly, and you know what you are doing.

5. Open the assignments page for the course you wish to import.

6. Click `Save Current Page Assignments`.

7. You should see the course code appear in the `Current Saved Courses` list.
   1. Click `View Saved Assignments` to view the raw stored JSON.
   2. Click `View Saved Courses` to return to the ordered list of course codes.
   3. Click `Clear Saved Assignments` to remove the saved assignments from storage.

8. Repeat steps 5–7 as appropriate.

9. Once you have saved the assignments of all your desired courses, click the `Import Saved Assignments` button to import to Notion.

## Installation

1. Clone this repository `$ git clone https://github.com/JamesNZL/notion-assignment-import.git`

2. Follow [this guide](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked) to install an unpacked extension