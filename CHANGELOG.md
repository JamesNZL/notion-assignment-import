# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.0.2](https://github.com/JamesNZL/notion-assignment-import/compare/v3.0.1...v3.0.2) (2022-04-19)


### Bug Fixes

* **interface:** :lipstick: display `JSON` in monospace font ([30aa357](https://github.com/JamesNZL/notion-assignment-import/commit/30aa357f7045eee9786c9ec10401f6a8a0188093))

### [3.0.1](https://github.com/JamesNZL/notion-assignment-import/compare/v3.0.0...v3.0.1) (2022-04-14)


### Bug Fixes

* **validator:** :label: `getCachedInput()` will return `undefined` if not cached ([5167e39](https://github.com/JamesNZL/notion-assignment-import/commit/5167e39c524d5d02d71023a13166932efd32a15d))
* **validator:** :speech_balloon: fix plural of `1 inputs...` ([87f6920](https://github.com/JamesNZL/notion-assignment-import/commit/87f6920f663e2551f2afc97e6f402d0f6ad1b8ab))

## [3.0.0](https://github.com/JamesNZL/notion-assignment-import/compare/v2.4.2...v3.0.0) (2022-04-13)


### ⚠ BREAKING CHANGES

* **options:** :boom: fix `timeZone` storage key
* **options:** :boom: change options storage keys to match `Options` interface

### Features

* **import:** :speech_balloon: alert the user on rate-limit ([9542109](https://github.com/JamesNZL/notion-assignment-import/commit/9542109ff52668546457d05293411dac55590be9))
* **interface:** :lipstick: style invalid input error messages ([59bbfce](https://github.com/JamesNZL/notion-assignment-import/commit/59bbfcec49f0662f3b78efdcbc3e492d7cc67776))
* **options:** :building_construction: finish implementation of `Options` object ([1e92478](https://github.com/JamesNZL/notion-assignment-import/commit/1e924789910a0b0264c3e7deb6971192a5f4b2f2))
* **options:** :card_file_box: enforce `null` if option is empty ([0a38336](https://github.com/JamesNZL/notion-assignment-import/commit/0a383363e39088e1e086bd07a12ca2e81c692c8e))
* **options:** :children_crossing: show red border when input is invalid ([77bf1b2](https://github.com/JamesNZL/notion-assignment-import/commit/77bf1b23fcedf435c921da8d1c49d931ea2b3e95))
* **options:** :construction: implement input validation ([27fd4a8](https://github.com/JamesNZL/notion-assignment-import/commit/27fd4a865f86f5b286154655059f1321fb182577))
* **options:** :goal_net: validate fields on input ([d7aae2b](https://github.com/JamesNZL/notion-assignment-import/commit/d7aae2b4e4e8071ff3f56d15fa4cfd85e963460e))
* **options:** :label: complete options types and implement ability to convert from `Options` nested object to `Fields` 'flat' object ([2c7968f](https://github.com/JamesNZL/notion-assignment-import/commit/2c7968fa54e95cea7532fbec637ea19d95843278))
* **options:** :lipstick: disable button if invalid and display `not-allowed` cursor ([559e69f](https://github.com/JamesNZL/notion-assignment-import/commit/559e69f888f1d86b3202a36827ba651bd032e1ec))
* **options:** :lipstick: reimplement save button error state and add WIP field error messages ([9bb02e3](https://github.com/JamesNZL/notion-assignment-import/commit/9bb02e3d69effd01cf31730b22d5d2dc4c189518))
* **options:** :lipstick: show missing required error automatically ([25b8fb9](https://github.com/JamesNZL/notion-assignment-import/commit/25b8fb9de7cf726a815049f4f86c637f88586e07))
* **options:** :sparkles: finish strongly/statically typing options ([3edc194](https://github.com/JamesNZL/notion-assignment-import/commit/3edc194098218e81ccdc6fca363dadb3cc9c626c))
* **options:** :sparkles: restore options on save ([8617091](https://github.com/JamesNZL/notion-assignment-import/commit/8617091b608a90c9d6319456f5c9674bcd4db901))
* **types:** :construction: add types for extension options ([36d46be](https://github.com/JamesNZL/notion-assignment-import/commit/36d46bec283f273d81fe67538e7769f4e2c2f023))
* **types:** :label: strongly type html ids in `popup.ts` ([36a5ad1](https://github.com/JamesNZL/notion-assignment-import/commit/36a5ad1ddb654b612595c8298c01c43e92db6f03))
* **types:** :label: strongly type record keys ([039bbea](https://github.com/JamesNZL/notion-assignment-import/commit/039bbea7e7b01a74c69fe13d7c10dd703797ccfd))
* **validator:** :lipstick: implement validator error messages ([24e5b3b](https://github.com/JamesNZL/notion-assignment-import/commit/24e5b3b5a44400a7ff956db8e402730282c45464))
* **validator:** :sparkles: implement support for only validating `onchange` ([cfb932a](https://github.com/JamesNZL/notion-assignment-import/commit/cfb932ac88f16de9d7910ef273d75e3eb6e6e40b))
* **validator:** :sparkles: implement validation of `databaseId` ([a082f05](https://github.com/JamesNZL/notion-assignment-import/commit/a082f05a696681f566d24d40cbf343b7f76360b6))
* **validator:** :sparkles: implement validation of `notionKey` ([6a062c3](https://github.com/JamesNZL/notion-assignment-import/commit/6a062c3c40bc8aa662c4e6d66e96de188b09adf3))
* **validator:** :sparkles: implement validation of `tz` time zone names ([9bcca21](https://github.com/JamesNZL/notion-assignment-import/commit/9bcca21b97fc920ffdccb84e4256fd3987d42cfe))
* **validator:** :speech_balloon: add validating status label and decouple save button from `FieldValidator` ([4ff7722](https://github.com/JamesNZL/notion-assignment-import/commit/4ff77226dcb9a81b10a9c721fdf1ad646478b5e9))
* **validator:** :speech_balloon: add validation error if offline ([e4d2170](https://github.com/JamesNZL/notion-assignment-import/commit/e4d2170a5a2506ec5833d51c975e5c6e161a0272))


### Bug Fixes

* **extension:** :lipstick: explicitly declare favicon ([ade8974](https://github.com/JamesNZL/notion-assignment-import/commit/ade897489db5e482cc9d29c5c54834c37c380ce9))
* **gitignore:** :truck: rename `typings/` -> `types/` due to `.gitignore` ([cdd0991](https://github.com/JamesNZL/notion-assignment-import/commit/cdd09915bc22ea02f74923332953cc96ac45ca28))
* **gulp:** :green_heart: use `\p{Emoji_Presentation}` regex flag instead ([1b47292](https://github.com/JamesNZL/notion-assignment-import/commit/1b47292cd1ec2509d494ee9b1080f89f4fbcff91))
* **import:** :goal_net: do not make new requests whilst rate-limited ([4431473](https://github.com/JamesNZL/notion-assignment-import/commit/4431473cc933719da5511cfc39477cd8858c1479))
* **options:** :boom: fix `timeZone` storage key ([60f5e7b](https://github.com/JamesNZL/notion-assignment-import/commit/60f5e7ba6997b3ecec3655e96c5fc45e58658a9b))
* **options:** :bug: display missing fields error if user tries to save without changing initial partial default values ([ae23909](https://github.com/JamesNZL/notion-assignment-import/commit/ae23909ebc7275daa36b24b4e705b3ec6122b731))
* **options:** :bug: fix `notion-property-status` id ([c417b60](https://github.com/JamesNZL/notion-assignment-import/commit/c417b6079e8701c243cc419e5d814f51ff30ad23))
* **options:** :bug: fix check for `INVALID_INPUT` ([59cb40d](https://github.com/JamesNZL/notion-assignment-import/commit/59cb40db341d3e1271eaeda14f76a5dc438504a9))
* **options:** :bug: reconstruct entries object before storage ([49b0d78](https://github.com/JamesNZL/notion-assignment-import/commit/49b0d7823963befb95e0a495f7f2aca6839bd2d0))
* **options:** :bug: reverse the check for valid `OptionConfiguration` keys ([7a435c0](https://github.com/JamesNZL/notion-assignment-import/commit/7a435c06ef68cd7d5db29dc217e0e5a0bf9bc7cc))
* **options:** :children_crossing: allow empty json object input ([870e921](https://github.com/JamesNZL/notion-assignment-import/commit/870e92184080b1050cdc1499d845f742597384f5))
* **options:** :goal_net: trim input whitespaces ([50bed6b](https://github.com/JamesNZL/notion-assignment-import/commit/50bed6b44ddd78fa03bb6c85ab2ed5c9d42a4bf4))
* **options:** :poop: temp fix after changed html ids ([62892fa](https://github.com/JamesNZL/notion-assignment-import/commit/62892fa7dc7bb98603b0d03a9a458d4d599985ed))
* **popup:** :bug: fix record indexing by id rather than `ButtonName` (introduced in 039bbea) ([0b90bb4](https://github.com/JamesNZL/notion-assignment-import/commit/0b90bb46ee2b2d6354eee3fcb94b6b0bf053fb5d))
* **types:** :bug: fix `ModifyDeep` giving primitive when modifying a primitive with an object type ([3cfb436](https://github.com/JamesNZL/notion-assignment-import/commit/3cfb436c5c627088a34814f785e87c992e1e7c71))
* **types:** :label: `courseCodeN` is actually saved as a `string` ([9606471](https://github.com/JamesNZL/notion-assignment-import/commit/96064711d63492e7e7dc3e70aa3429f7bcb8ca66))
* **types:** :label: `notion.propertyNames.name` is required ([14c660f](https://github.com/JamesNZL/notion-assignment-import/commit/14c660f1956a092be8d3db63b00ef227f22ce089))
* **types:** :label: `selectors` should only be in `Options`, not `SavedOptions` ([50ca28c](https://github.com/JamesNZL/notion-assignment-import/commit/50ca28c8ff99566141a33534414e106f02ff1df6))
* **types:** :label: every nested option must have its own `OptionConfiguration` ([d3aed46](https://github.com/JamesNZL/notion-assignment-import/commit/d3aed4688fb22ad21f114772fd8b3d2540a91575))
* **types:** :label: fix override of `SavedOptions` type ([8af55f9](https://github.com/JamesNZL/notion-assignment-import/commit/8af55f9c85094038b9197a890b4729b98c068728))
* **types:** :poop: a key of `SavedOptions` will never be null, only `''` ([cf7f34d](https://github.com/JamesNZL/notion-assignment-import/commit/cf7f34d329e573bbd56447718dbc308dc4462730))
* **validator:** :bug: fix emoji type guard by enforcing `^$` and matching `&zwj` ([de9a816](https://github.com/JamesNZL/notion-assignment-import/commit/de9a816c273b9f30c713f3839572569885696d7e))
* **validator:** :bug: properly check for `object Object` type, and not just a non-primitive ([d745c36](https://github.com/JamesNZL/notion-assignment-import/commit/d745c362c5d6295518533aca0f1486c96b4229ea))


* **options:** :boom: change options storage keys to match `Options` interface ([837cdc3](https://github.com/JamesNZL/notion-assignment-import/commit/837cdc3606367b85d291c7370d59bc27eb1c2333))

### [2.4.2](https://github.com/JamesNZL/notion-assignment-import/compare/v2.4.1...v2.4.2) (2022-04-09)


### Bug Fixes

* **gulp:** :bug: fix parsing of `--debug` flag for source map generation ([b061cfa](https://github.com/JamesNZL/notion-assignment-import/commit/b061cfa23e7dd10c0c361671bec5c1f82da2c388))

### [2.4.1](https://github.com/JamesNZL/notion-assignment-import/compare/v2.4.0...v2.4.1) (2022-04-09)


### Bug Fixes

* **interface:** :lipstick: darken interface ([fe02c2b](https://github.com/JamesNZL/notion-assignment-import/commit/fe02c2bad5161f2f9f5e9cab98d1efd008fae817))
* **interface:** :lipstick: fix spacing between `.half-width` buttons ([56a6a09](https://github.com/JamesNZL/notion-assignment-import/commit/56a6a098b315ca3a194cf307fa9ca94f218964bf))
* **interface:** :lipstick: tweak background colour ([d68cded](https://github.com/JamesNZL/notion-assignment-import/commit/d68cded0756b264274fd2a3d8429c3d7cb701e36))

## [2.4.0](https://github.com/JamesNZL/notion-assignment-import/compare/v2.3.0...v2.4.0) (2022-04-08)


### Features

* **import:** :goal_net: implement notion rate limit handler ([8f23f4c](https://github.com/JamesNZL/notion-assignment-import/commit/8f23f4ca6b8e311784106169d138c7aa2fc4140a))
* **interface:** :lipstick: `overflow-y: scroll` saved JSON within its container ([ad0114e](https://github.com/JamesNZL/notion-assignment-import/commit/ad0114e276fdae1616e2003968372b43505dc3a0))
* **interface:** :lipstick: contain `textarea` `min-width` too ([b417a3c](https://github.com/JamesNZL/notion-assignment-import/commit/b417a3c20a3e9d6f93141de8bec1e83b36f399a9))
* **interface:** :lipstick: set `min-height` and `max-height` of scrollbar thumb ([5eb0709](https://github.com/JamesNZL/notion-assignment-import/commit/5eb07096e877b4fdeb5a721df1ee42a75b293bff))


### Bug Fixes

* **interface:** :lipstick: fix scrollbar hover colour matching background colour ([6d08196](https://github.com/JamesNZL/notion-assignment-import/commit/6d08196a16ac1c9c28329abbf23619ccb120c880))

## [2.3.0](https://github.com/JamesNZL/notion-assignment-import/compare/v2.2.0...v2.3.0) (2022-04-08)


### Features

* **extension:** :lipstick: display `nth li` in monospace font ([39e605f](https://github.com/JamesNZL/notion-assignment-import/commit/39e605fe3d07a4a4407d1238dfbeb2fc89f477f6))
* **extension:** :sparkles: allow configuration of empty notion database property names/values ([ee81734](https://github.com/JamesNZL/notion-assignment-import/commit/ee8173468f852b502a3fa2cf416bb501c18447b0))
* **extension:** :speech_balloon: refer to set-up instructions on `NOTION_KEY` or `DATABASE_ID` error ([30aa9d3](https://github.com/JamesNZL/notion-assignment-import/commit/30aa9d3470c8602f33dcdbf78c7fc0d92249392e))
* **interface:** :lipstick: change `background-color` on `input` field `:focus` ([c1bfa29](https://github.com/JamesNZL/notion-assignment-import/commit/c1bfa2925c8c39380feed36297d1810ef1c18345))
* **interface:** :lipstick: lighten `--dark-grey-hover` ([2468dc8](https://github.com/JamesNZL/notion-assignment-import/commit/2468dc8222b573f73814ed0ed18813afac1d0602))
* **interface:** :sparkles: allow `ctrl`+`s` to save options ([9bf9b86](https://github.com/JamesNZL/notion-assignment-import/commit/9bf9b861d6cf22377a93b02dd50181d2362ddd26))
* **options:** :children_crossing: implement required fields ([6db44ed](https://github.com/JamesNZL/notion-assignment-import/commit/6db44edf79eff181b301eb1f63f505a5e4861697))


### Bug Fixes

* **import:** :adhesive_bandage: use configured page name property ([02061d7](https://github.com/JamesNZL/notion-assignment-import/commit/02061d733d37f4d3649f209d41512e7a15ee5f54))
* **import:** :bug: only import saved assignments with due dates in the future ([1ea21ea](https://github.com/JamesNZL/notion-assignment-import/commit/1ea21eae7b0d2429416012bd3b9f7f7209924bce))
* **parser:** :bug: set assignments with due dates in the past as invalid ([cede31c](https://github.com/JamesNZL/notion-assignment-import/commit/cede31ca6a46dd6fce2ae86ca0263966ac2dda2f))

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
