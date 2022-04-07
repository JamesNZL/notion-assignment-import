# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 2.2.0 (2022-04-07)


### ⚠ BREAKING CHANGES

* :art: refactor with classes
* **extension:** significant changes to dependencies and `import` structure
* renamed `index` -> `import`
* implements change to input schema

### Features

* :boom: change input schema to allow direct paste of `parser` array ([8b076ce](https://github.com/JamesNZL/notion-assignment-import/commit/8b076cef73cbd7536a456a2927e2882b93036cff))
* :building_construction: restructure project for browser extension creation ([7fc5223](https://github.com/JamesNZL/notion-assignment-import/commit/7fc52233bf4d554b2e52a38bf6c7fc4f8597d274))
* :loud_sound: add error logs for skipped assignments ([c6661bd](https://github.com/JamesNZL/notion-assignment-import/commit/c6661bd4610975745ae264e521b3eb384e47fde9))
* :sparkles: add support for assignments without due date ([23045b9](https://github.com/JamesNZL/notion-assignment-import/commit/23045b9d80765c72c162a9a20901acd2c3b6ba32))
* :sparkles: complete mvp ([3cbe2e2](https://github.com/JamesNZL/notion-assignment-import/commit/3cbe2e2fb706b8a8eddf69b93fafa1c7ad6b2981))
* :sparkles: implement pagination support ([7865096](https://github.com/JamesNZL/notion-assignment-import/commit/7865096fe0cd53ac9077ce7fab767aff058cbbcd))
* :sparkles: modify `SavedAssignments` schema ([120cf43](https://github.com/JamesNZL/notion-assignment-import/commit/120cf43b23945f0293b1f9d7ac5a379920e9cc3e))
* :sparkles: round current available time to next full hour ([6e83f8c](https://github.com/JamesNZL/notion-assignment-import/commit/6e83f8ccc76e50c641b2a358e9e082ce70f89850))
* :sparkles: use separate property for date span ([a04e8f2](https://github.com/JamesNZL/notion-assignment-import/commit/a04e8f26e5485129c94cb7b71c1ff3e72f496e1f))
* :tada: initial commit ([d6ab0c6](https://github.com/JamesNZL/notion-assignment-import/commit/d6ab0c6f175f0d925dc0525f4a4109e76fc4f4cc))
* **extension:** :bento: add extension favicon ([c9261ce](https://github.com/JamesNZL/notion-assignment-import/commit/c9261ce061a7bdc12ffab722db73102938242f5e))
* **extension:** :children_crossing: add progress/completion indications ([42152f6](https://github.com/JamesNZL/notion-assignment-import/commit/42152f69dc7e79a28cce3b99664baa7d63f573dd))
* **extension:** :children_crossing: change `ul` to `ol` ([efe040e](https://github.com/JamesNZL/notion-assignment-import/commit/efe040e3442ac304f942ea3a3f48b18f442b410d))
* **extension:** :children_crossing: reformat ui ([765c713](https://github.com/JamesNZL/notion-assignment-import/commit/765c713032ffd3940592360f0d34df1dcefcfb99))
* **extension:** :construction: add import to notion button ([ef17019](https://github.com/JamesNZL/notion-assignment-import/commit/ef17019a40b0cf45e7931bef707745c3eea62fcf))
* **extension:** :construction: add parsing script ([b5c6684](https://github.com/JamesNZL/notion-assignment-import/commit/b5c6684b457122ba68621cbe8905ea13d191d3ef))
* **extension:** :construction: add provisional notion import functionality ([fb56193](https://github.com/JamesNZL/notion-assignment-import/commit/fb56193bdf91b5125d5884005bc5306e22ef4f18))
* **extension:** :construction: add template options storage functionality ([82a9879](https://github.com/JamesNZL/notion-assignment-import/commit/82a987981bf70f69325e1f62282e523b17f1f8d2))
* **extension:** :lipstick: add button hover effects ([55a2905](https://github.com/JamesNZL/notion-assignment-import/commit/55a2905821ebb5e631258af0525be2fa88a3907b))
* **extension:** :lipstick: add colours to clear/save buttons ([87f0a6a](https://github.com/JamesNZL/notion-assignment-import/commit/87f0a6aa9dd8f71e31b3f152bc79f6ea6dab449a))
* **extension:** :lipstick: center-align options page ([091bc41](https://github.com/JamesNZL/notion-assignment-import/commit/091bc41a17690813d95791e0e9367d1eafefbc04))
* **extension:** :lipstick: include icon in saved course list ([049f7a9](https://github.com/JamesNZL/notion-assignment-import/commit/049f7a93c4f3cef719c856ceefc7cc9f998d6b5f))
* **extension:** :lipstick: minor ui updates ([a7dc713](https://github.com/JamesNZL/notion-assignment-import/commit/a7dc71347b645b8404f0a28333dc3ad7839b217f))
* **extension:** :lipstick: open options as page ([da91ccf](https://github.com/JamesNZL/notion-assignment-import/commit/da91ccf18442406a188b0dd7acbb00dfca7f2d32))
* **extension:** :lipstick: overhaul extension user interface ([47ffc4f](https://github.com/JamesNZL/notion-assignment-import/commit/47ffc4fb22867573b7ee0d5a5a5945fa4f32db6e))
* **extension:** :lipstick: style options page ([3beb196](https://github.com/JamesNZL/notion-assignment-import/commit/3beb1961c1bb7b990049e9685a1eec1ccb7b3c63))
* **extension:** :sparkles: add `View Saved Assignments` and `View Saved Courses` buttons ([4b0513f](https://github.com/JamesNZL/notion-assignment-import/commit/4b0513fca8bcf147e1c0a00efa66236de7666323))
* **extension:** :sparkles: add alert if import errors were encountered ([762666c](https://github.com/JamesNZL/notion-assignment-import/commit/762666c4f6900c68ad9d54008b8be7a55bfed7c3))
* **extension:** :sparkles: add alert if no assignments found ([31b3e64](https://github.com/JamesNZL/notion-assignment-import/commit/31b3e64dcaaac976f12d3e1a8e617c6e6abf6413))
* **extension:** :sparkles: add basic popup ([fae4bd7](https://github.com/JamesNZL/notion-assignment-import/commit/fae4bd7e6849d7c2b3c9d7d4cf1dc97e591e32eb))
* **extension:** :sparkles: add basic storage capability ([84ee430](https://github.com/JamesNZL/notion-assignment-import/commit/84ee4303213b05de1b5e8e3a3d075891184f81a4))
* **extension:** :sparkles: add button to copy saved assignments to clipboard ([8b08130](https://github.com/JamesNZL/notion-assignment-import/commit/8b08130cbca6cf0832c38e653ffafdf2e45edcda))
* **extension:** :sparkles: add functionality to clear storage ([ff68ff8](https://github.com/JamesNZL/notion-assignment-import/commit/ff68ff824e43e43e95ee3944e1274f7f0ec0ac00))
* **extension:** :sparkles: add input field for course code ([a37080d](https://github.com/JamesNZL/notion-assignment-import/commit/a37080d53ccadc01c30e390194bcb8145df30eec))
* **extension:** :sparkles: add link to repository ([bf60600](https://github.com/JamesNZL/notion-assignment-import/commit/bf6060053b6b0acbf84eb954eb59827d5e389987))
* **extension:** :sparkles: add list of current saved courses ([d9652bc](https://github.com/JamesNZL/notion-assignment-import/commit/d9652bc6151875e163bd6e7d62d5907b4d406e7e))
* **extension:** :sparkles: add notion course emoji support ([1760d2f](https://github.com/JamesNZL/notion-assignment-import/commit/1760d2f6cd861357ff949e03088a383e8e12a84a))
* **extension:** :sparkles: add options support for `notionKey` and `databaseId` ([c0ba070](https://github.com/JamesNZL/notion-assignment-import/commit/c0ba0704c0b8668dbdd54855bc30215de224d7a8))
* **extension:** :sparkles: add options to configure notion database properties ([11ae69b](https://github.com/JamesNZL/notion-assignment-import/commit/11ae69bd77b51f20e688df0881f6a4a60c56d380))
* **extension:** :sparkles: add template options page ([67b8eb6](https://github.com/JamesNZL/notion-assignment-import/commit/67b8eb65d00f0b41c8bbc2c417d0680270e1461c))
* **extension:** :sparkles: addded course code overrides functionality ([af67f92](https://github.com/JamesNZL/notion-assignment-import/commit/af67f9292587c1f443d50e1d10ebad428d3b65b4))
* **extension:** :sparkles: automatically parse course code from document ([37292b0](https://github.com/JamesNZL/notion-assignment-import/commit/37292b01eba113825fd962b2b34b7094aec2310a))
* **extension:** :sparkles: count number of assignments in each course ([8504ebc](https://github.com/JamesNZL/notion-assignment-import/commit/8504ebc832317f88c4517d7298c6dc68ecb85083))
* **extension:** :sparkles: implement options ([f5035eb](https://github.com/JamesNZL/notion-assignment-import/commit/f5035eb2c573ee204ca9a25293bf28802c9f72da))
* **extension:** :sparkles: list created assignments in alert ([35e2dd7](https://github.com/JamesNZL/notion-assignment-import/commit/35e2dd764b1c6c4240bab307e711fade342f25f2))
* **manifest:** :wrench: create initial manifest file ([149caf9](https://github.com/JamesNZL/notion-assignment-import/commit/149caf9db5ebf60373181b5460d5e45482a639a9))


### Bug Fixes

* :bug: ensure generated date is in desired timezone ([d956e28](https://github.com/JamesNZL/notion-assignment-import/commit/d956e2882463b0db0e5cd1d5c659a97ea9c8ec37))
* :bug: fix `dueDate` class name ([d5580fe](https://github.com/JamesNZL/notion-assignment-import/commit/d5580fe3193928099d6a67b4e47b3cd4eb07254c))
* :bug: fix datestring formatting issue ([49058af](https://github.com/JamesNZL/notion-assignment-import/commit/49058af6a83a83ed9184a96e2ebf694df9649eab))
* :bug: fix timezone issue (again) ([07a5519](https://github.com/JamesNZL/notion-assignment-import/commit/07a5519013952d0a55927acf7a0fe9cfcd8fcfcf))
* :bug: fix timezone offset issue ([7884613](https://github.com/JamesNZL/notion-assignment-import/commit/788461330ddccf82972f4c267147df9f1613585b))
* **extension:** :bug: alert if no valid assignments found, and set `savedCourse` to prevent infinite `while` loop in `parseAssignments` ([2035816](https://github.com/JamesNZL/notion-assignment-import/commit/20358167ba22a9e637dbf5b0cbea607f824878be))
* **extension:** :bug: fix 'no assignments found' alert when assignments are just all invalid ([3d9e2b5](https://github.com/JamesNZL/notion-assignment-import/commit/3d9e2b5cb313bd31162b86e62e2e070ecfbb5ef9))
* **extension:** :bug: fix injection of content script ([5f58cf1](https://github.com/JamesNZL/notion-assignment-import/commit/5f58cf1a1c61d68e755548f3fc1adcf07325e398))
* **extension:** :lipstick: modify import/export wording for clarity ([2fc6022](https://github.com/JamesNZL/notion-assignment-import/commit/2fc6022b1663f308444caffee0fc6c308e4f9d53))
* **manifest:** :truck: fix path to favicon ([d0a3eb5](https://github.com/JamesNZL/notion-assignment-import/commit/d0a3eb5c268b5f4e57a6b265c4bffaf8c74e67c9))
* **manifest:** :wrench: add notion api to `host_permissions` field ([4b866c1](https://github.com/JamesNZL/notion-assignment-import/commit/4b866c1bd5d06476b523151ef477e866f35fb40a))
* **parser:** :bug: add fix from a507825 to guide section ([8a3f348](https://github.com/JamesNZL/notion-assignment-import/commit/8a3f34846744273a43a80d0ddfc58808dc177760))
* **parser:** :bug: ensure available date is 'not available until' ([a507825](https://github.com/JamesNZL/notion-assignment-import/commit/a507825712cd2a1805b84a5cf5a720bf0ff05356))


* :art: refactor with classes ([3c0a7ed](https://github.com/JamesNZL/notion-assignment-import/commit/3c0a7ede5173914f8bccd73ea155a48992d6035b))
