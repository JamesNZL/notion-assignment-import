## Requirements

1. `.env` file in top-level folder with:
	```text
	NOTION_KEY=<PASTE_YOUR_NOTION_INTEGRATION_SECRET>
	TO_DO_ID=<PASTE_YOUR_TO_DO_DATABASE_IDENTIFIER>
	INPUT_FILEPATH=<FILEPATH TO YOUR INPUT JSON FILE>
	```

2. `[filename].json` file at the `INPUT_FILEPATH` as per the following schema:
	```javascript
	{
		"name": string, // Assignment Name
		"course": string, // Assignment Course Name
		"url": string, // Assignment URL
		"available": string, // Date from which the assignment is available
		"due": string // Assignment due date
	}[]
	```