# Canvas Assignment Parser - updated 17/02/22

- `HTMLCollection` of assignments:
  > ```javascript
  > document.getElementsByClassName('assignment');
  > ```

- Iterate through `HTMLCollection`:
  > ```javascript
  > Object.values(document.getElementsByClassName('assignment')).forEach(assignment => ...);
  > ```

- Parse assignment names:
  > ```javascript
  > assignment.querySelector('.ig-title').textContent.trim();
  > ```

- Parse assignment URLs:
  > ```javascript
  > assignment.querySelector('.ig-title').href;
  > ```

- Parse assignment available dates:
  > ```javascript
  > assignment.querySelector('.assignment-date-available .screenreader-only')?.textContent.trim() ?? '';
  > ```

- Parse assignment due dates:
  > ```javascript
  > assignment.querySelector('.assignment-date-due .screenreader-only')?.textContent.trim() ?? '';
  > ```

# Parsing script

```javascript
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
  VALUES: {
    NOT_AVAILABLE_STATUS: 'Not available until',
  },
};

const assignments = document.getElementsByClassName(CONSTANTS.CLASSES.ASSIGNMENT);

const parseAvailableDate = assignment => {
  if (assignment.querySelector(`.${CONSTANTS.CLASSES.AVAILABLE_DATE} .${CONSTANTS.CLASSES.AVAILABLE_STATUS}`)?.textContent.trim() !== CONSTANTS.VALUES.NOT_AVAILABLE_STATUS) return '';

  return assignment.querySelector(`.${CONSTANTS.CLASSES.AVAILABLE_DATE} .${CONSTANTS.CLASSES.SCREENREADER_ONLY}`)?.textContent.trim() ?? '';
}

const parse = assignment => ({
	name: assignment.querySelector(`.${CONSTANTS.CLASSES.TITLE}`).textContent.trim(),
	course: CONSTANTS.COURSE,
	url: assignment.querySelector(`.${CONSTANTS.CLASSES.TITLE}`).href,
	available: parseAvailableDate(assignment),
	due: assignment.querySelector(`.${CONSTANTS.CLASSES.DUE_DATE} .${CONSTANTS.CLASSES.SCREENREADER_ONLY}`)?.textContent.trim() ?? '',
})

const parsed = Object.values(assignments).map(assignment => parse(assignment));

JSON.stringify(parsed);
```

NOTE: Manually review output JSON for once-off events such as tests and exams!