## Requirements

1. `.env` file in top-level folder with:
	```text
	NOTION_KEY=<PASTE_YOUR_NOTION_INTEGRATION_SECRET>
	TO_DO_ID=<PASTE_YOUR_TO_DO_DATABASE_IDENTIFIER>
	INPUT_FILEPATH=<FILEPATH TO YOUR INPUT JSON FILE>
	```

2. `[filename].json` file at the `INPUT_FILEPATH` as per the following schema:
	> Use the script in [`parser.md`](https://github.com/JamesNZL/notion-assignment-import/blob/master/parser.md#parsing-script) to automatically generate this from the Canvas assignments page!
	```javascript
	{
		"name": string, // Assignment Name
		"course": string, // Assignment Course Name
		"url": string, // Assignment URL
		"available": string, // Date from which the assignment is available
		"due": string // Assignment due date
	}[][]
	```
	### Example:
	```javascript
	[
		[
			{
				"name": "Assignment 1",
				"course": "COURSE 001",
				"url": "https://canvas.university.ac.nz/courses/00001/assignments/00001",
				"available": "",
				"due": "Sep 21 at 9:21pm"
			},
			{
				"name": "Assignment 2",
				"course": "COURSE 001",
				"url": "https://canvas.university.ac.nz/courses/00001/assignments/00002",
				"available": "Sep 21 at 9:21pm",
				"due": "Sep 28 at 9:21pm"
			}
		],
		[
			{
				"name": "Assignment 1",
				"course": "COURSE 002",
				"url": "https://canvas.university.ac.nz/courses/00002/assignments/00001",
				"available": "Aug 17 at 11:59pm",
				"due": "Sep 1 at 11:59pm"
			}
		]
	]
	```