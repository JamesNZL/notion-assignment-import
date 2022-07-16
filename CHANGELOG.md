# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.2.1](https://github.com/JamesNZL/notion-assignment-import/compare/v4.2.0...v4.2.1) (2022-07-16)


### Bug Fixes

* **interface:** :lipstick: fix select dropdown arrow ([be24484](https://github.com/JamesNZL/notion-assignment-import/commit/be244845f708254d6501bf2faf0b1544bef7427c))
* **interface:** :lipstick: lighten light mode active state ([04b1cee](https://github.com/JamesNZL/notion-assignment-import/commit/04b1ceea5058bd4c33cb8a6bbc5a8a3c453cd3c7))
* **options:** :bug: fix `this` bindings ([2899320](https://github.com/JamesNZL/notion-assignment-import/commit/2899320f013e8f4b5fc26c544ac36ae97cd89edb))
* **popup:** :lipstick: fix margin of `No saved ...` text ([651beb4](https://github.com/JamesNZL/notion-assignment-import/commit/651beb42552b4b1d0443beda8955b3e41324c08b))

## [4.2.0](https://github.com/JamesNZL/notion-assignment-import/compare/v4.1.1...v4.2.0) (2022-07-15)


### Features

* **interface:** :children_crossing: add indicator for unsaved changes ([#53](https://github.com/JamesNZL/notion-assignment-import/issues/53)) ([7a8166d](https://github.com/JamesNZL/notion-assignment-import/commit/7a8166d621d224b177a2c35493052f36a6141a2b))
* **interface:** :lipstick: darken dark mode hover state ([8fac4e7](https://github.com/JamesNZL/notion-assignment-import/commit/8fac4e7d80d086fe365dcc6ffeba50341603e832))
* **interface:** :sparkles: add light mode ([#52](https://github.com/JamesNZL/notion-assignment-import/issues/52)) ([2404a1a](https://github.com/JamesNZL/notion-assignment-import/commit/2404a1a77b25a294ea23f1cccc81ded45470f25e)), closes [#51](https://github.com/JamesNZL/notion-assignment-import/issues/51) [#49](https://github.com/JamesNZL/notion-assignment-import/issues/49)
* **options:** :children_crossing: add unsaved exit confirmation dialogue ([77ac7f8](https://github.com/JamesNZL/notion-assignment-import/commit/77ac7f8ffe5339ad877fea0d463ea0f46a23b5e8))


### Bug Fixes

* **eslint:** :rotating_light: fix eslint for gulpfile ([6b0b449](https://github.com/JamesNZL/notion-assignment-import/commit/6b0b449ca45b10177c6aa733586497637afce1ab))
* **interface:** :bug: fix premature toggle of property value inputs ([49f7551](https://github.com/JamesNZL/notion-assignment-import/commit/49f7551ebf4dc77e0c6dbab298d7c519c7645213))
* **interface:** :lipstick: fix popup codeblock margin ([9818545](https://github.com/JamesNZL/notion-assignment-import/commit/9818545be5e8ef5500b7ada875ccc04019b68442))
* **options:** :bug: fix unsaved exit confirmation ([0e55d27](https://github.com/JamesNZL/notion-assignment-import/commit/0e55d275b4f703b08adb9abb55945071e076b76e))
* **options:** :pencil2: fix typo ([909e8ab](https://github.com/JamesNZL/notion-assignment-import/commit/909e8ab3bd3fafd6c1f0f18147c5967a17d077a5))
* **validator:** :bug: fix markup of html validator errors ([d6733ee](https://github.com/JamesNZL/notion-assignment-import/commit/d6733ee610b10eb0968c07f8d60be048089c678f))

### [4.1.1](https://github.com/JamesNZL/notion-assignment-import/compare/v4.1.0...v4.1.1) (2022-07-03)


### Bug Fixes

* **interface:** :lipstick: fix spacing bug above save button ([5e65e8e](https://github.com/JamesNZL/notion-assignment-import/commit/5e65e8ebf663c3daf0a39d279f99c27e7aba2228))
* **interface:** :lipstick: make navbar x padding responsive with `vw` ([8353b88](https://github.com/JamesNZL/notion-assignment-import/commit/8353b88acc8e1e266e38fd20a99f3131f681705b))

## [4.1.0](https://github.com/JamesNZL/notion-assignment-import/compare/v4.0.1...v4.1.0) (2022-07-03)


### Features

* **elements:** :children_crossing: toggle dependents based on own validity ([0e52961](https://github.com/JamesNZL/notion-assignment-import/commit/0e52961319c67a0f9ef1190282a45fb3d3790493))


### Bug Fixes

* **popup:** :alien: configure integration in options if no oauth ([b80ea69](https://github.com/JamesNZL/notion-assignment-import/commit/b80ea694673c6f8313e2b06f98511f9929b274bf))
* **safari:** :alien: add internal integration token fallback ([322eec1](https://github.com/JamesNZL/notion-assignment-import/commit/322eec1a58f065fef731c525e94bd32f442ba78f))
* **safari:** :construction: throw error if no `browser.identity` ([9ff6053](https://github.com/JamesNZL/notion-assignment-import/commit/9ff6053e10f72fea1cabe38a35c97e1cda0f12b7))
* **validator:** :bug: force input validation on save ([0ad84f3](https://github.com/JamesNZL/notion-assignment-import/commit/0ad84f39798998af45f7f98477f05d48aa123b58))
* **validator:** :speech_balloon: fix `'a emoji'` ([a390c05](https://github.com/JamesNZL/notion-assignment-import/commit/a390c055327a9c5aa6c6639e9b9cccf6a4de6e66))

### [4.0.1](https://github.com/JamesNZL/notion-assignment-import/compare/v4.0.0...v4.0.1) (2022-07-02)


### Bug Fixes

* **firefox:** :rotating_light: use `insertAdjacentElement` ([b5b4a38](https://github.com/JamesNZL/notion-assignment-import/commit/b5b4a38630acf6d58bb001fd9395bb9c3ab310a5))

## [4.0.0](https://github.com/JamesNZL/notion-assignment-import/compare/v3.0.6...v4.0.0) (2022-07-01)


### ⚠ BREAKING CHANGES

* Notion's implementation of a 'status' property with a DEFAULT value makes this configurable option redudant. However, this is marked as a BREAKING CHANGE, as existing users will need to change their Notion database property to the new 'Status' type.

### Features

* :alien: remove support for status property ([12897bd](https://github.com/JamesNZL/notion-assignment-import/commit/12897bd9a9b89c1934ac85c736198f70410b6f18))
* :children_crossing: add alert for breaking change 12897bd ([aebfbbe](https://github.com/JamesNZL/notion-assignment-import/commit/aebfbbe60711df43dc9aff3d301de6c35a0ceee7))
* **elements:** :construction: add restore rows functionality ([d7e2d52](https://github.com/JamesNZL/notion-assignment-import/commit/d7e2d522ded907babbc015df82aac4b13ba0a3f7))
* **elements:** :construction: add/remove rows as appropriate ([641f0a8](https://github.com/JamesNZL/notion-assignment-import/commit/641f0a871fcd493a63b6bbd46d024769b467bd1f))
* **elements:** :construction: implement bones of `KeyValueGroup` ([ae180e9](https://github.com/JamesNZL/notion-assignment-import/commit/ae180e9340d404b6f71f2a5ab9c7bfa2d041cc21))
* **elements:** :construction: only add/remove rows if inputs are valid ([2fab60f](https://github.com/JamesNZL/notion-assignment-import/commit/2fab60fe375b1f4e7f24b2eacb3f9d3ba9282244))
* **elements:** :construction: serialise inputs and update `valueInput` ([1152135](https://github.com/JamesNZL/notion-assignment-import/commit/11521351a84a459fdd541ca45b49030c15cc23ec))
* **elements:** :sparkles: add `getLabels()` method to `Input` ([fc01f19](https://github.com/JamesNZL/notion-assignment-import/commit/fc01f19937fcb15fb9af242a8251fbaaf4c3cbeb))
* **elements:** :sparkles: add show/hide methods to `Input` ([51a0f37](https://github.com/JamesNZL/notion-assignment-import/commit/51a0f3746bfb2564e842afc871fe6aa6d2bf5b39))
* **elements:** :technologist: export `Element` from index ([d08decd](https://github.com/JamesNZL/notion-assignment-import/commit/d08decd101eef34eb90c3c733d30586f0cca03bb))
* **import:** :sparkles: reimplement import ([b4e3295](https://github.com/JamesNZL/notion-assignment-import/commit/b4e329543c72144030d42ca23fd19484b35b8079))
* **interface:** :children_crossing: add select loading placeholder ([f794006](https://github.com/JamesNZL/notion-assignment-import/commit/f794006f4bfff345180957b16d4bf05605f2a2c3))
* **interface:** :children_crossing: fake-clear list on first click ([c9c6f54](https://github.com/JamesNZL/notion-assignment-import/commit/c9c6f54d89369d7eefb2477fe4405e05ef14e1a3))
* **interface:** :children_crossing: pre-select saved `databaseId` ([fec38cc](https://github.com/JamesNZL/notion-assignment-import/commit/fec38cc05808477144348495a3b92d256e78834b))
* **interface:** :children_crossing: set default value placeholder ([ea7f839](https://github.com/JamesNZL/notion-assignment-import/commit/ea7f839daab927691b84a5b61cebd61d99654583))
* **interface:** :children_crossing: show correct button for auth state ([8042748](https://github.com/JamesNZL/notion-assignment-import/commit/804274884738e5046508bae9f2f079461ffe4f57))
* **interface:** :children_crossing: validate emoji field on `'input'` ([ba94291](https://github.com/JamesNZL/notion-assignment-import/commit/ba942918ed6d66cf871186faa887c33583b2761e))
* **interface:** :construction: add button labels ([ae98d6d](https://github.com/JamesNZL/notion-assignment-import/commit/ae98d6d0e4522aca06a4c1be64fc1827ff051772))
* **interface:** :construction: apply initial styling to dropdown ([e8d6227](https://github.com/JamesNZL/notion-assignment-import/commit/e8d6227965919d2af655b669aaa6460fcf6e9a7d))
* **interface:** :fire: remove emphasis button border ([ab2801c](https://github.com/JamesNZL/notion-assignment-import/commit/ab2801cfa214fc594a3980a74bdbda41d35e5280))
* **interface:** :lipstick: `:hover` and `:active` styles for segmented control ([d0b5419](https://github.com/JamesNZL/notion-assignment-import/commit/d0b54190a6f1a3198dac69803a67dcd7ea8f98e9))
* **interface:** :lipstick: add `.button` `box-shadow`s ([a924981](https://github.com/JamesNZL/notion-assignment-import/commit/a924981885eb5a23ea0377c344c264d70cd08952))
* **interface:** :lipstick: add button `:active` styles ([c8db69f](https://github.com/JamesNZL/notion-assignment-import/commit/c8db69f540b3ba4b085eafcf91af2372ac1e39cf))
* **interface:** :lipstick: add extra margin to red buttons ([602dafd](https://github.com/JamesNZL/notion-assignment-import/commit/602dafddb9ed1f15ddfb76a9e689cc3552b4ea18))
* **interface:** :lipstick: add options navbar ([72f2126](https://github.com/JamesNZL/notion-assignment-import/commit/72f2126cd07d8906ad3371ecc3d563c115aad097))
* **interface:** :lipstick: add right margin to options button ([493632b](https://github.com/JamesNZL/notion-assignment-import/commit/493632b0c5f43013fe7c68f14d32dc3ac53ec7b6))
* **interface:** :lipstick: add slight `border` to buttons ([3d7e926](https://github.com/JamesNZL/notion-assignment-import/commit/3d7e9269047ce526f01e360fa472edb9ae83cdb1))
* **interface:** :lipstick: add spacing between course list `li`s ([b3cc325](https://github.com/JamesNZL/notion-assignment-import/commit/b3cc325bdb58fc7dc20a2fab33e54eb5bf80687e))
* **interface:** :lipstick: add/replace icons ([d6702fa](https://github.com/JamesNZL/notion-assignment-import/commit/d6702fa65617c5c0f977636684615b805a5e28e6))
* **interface:** :lipstick: adjust advanced options headings ([a8eb1db](https://github.com/JamesNZL/notion-assignment-import/commit/a8eb1db4b254d8ed292b20ecb1aa1357b5221720))
* **interface:** :lipstick: change options button to an icon ([b628ee5](https://github.com/JamesNZL/notion-assignment-import/commit/b628ee51bf273d609b049a44a89668b1cc685c9f))
* **interface:** :lipstick: darken `--red` ([d9edd85](https://github.com/JamesNZL/notion-assignment-import/commit/d9edd85ce9ef8778996e21d5d855308de4264eba))
* **interface:** :lipstick: decrease margin below `h2` ([4a9efe1](https://github.com/JamesNZL/notion-assignment-import/commit/4a9efe17b2fcb28547508667acc5b5a91871ab8c))
* **interface:** :lipstick: display actions buttons on separate rows ([77f3bc0](https://github.com/JamesNZL/notion-assignment-import/commit/77f3bc0c8f1c5e7e8de22128e89ceff45509565e))
* **interface:** :lipstick: display database emojis in select ([de9b914](https://github.com/JamesNZL/notion-assignment-import/commit/de9b91402e476e6eedc61b0d11c6e10f2d3d8ee3))
* **interface:** :lipstick: display database name in select ([49f25c5](https://github.com/JamesNZL/notion-assignment-import/commit/49f25c58fd0a00eec6d913acea6709ad7a979f90))
* **interface:** :lipstick: enhance `border-radius` ([15f2613](https://github.com/JamesNZL/notion-assignment-import/commit/15f2613eaa34784be4a8fc7ab4aeeec9e6586d20))
* **interface:** :lipstick: hide `copyJSON` button by default ([fea643d](https://github.com/JamesNZL/notion-assignment-import/commit/fea643dd77639c73cb0d26705757e8b8be4455d7))
* **interface:** :lipstick: hide empty tiles ([b46be60](https://github.com/JamesNZL/notion-assignment-import/commit/b46be6086bdfafcfdcf19cf8f069b073fac6852f))
* **interface:** :lipstick: increase `border-radius` ([2b28958](https://github.com/JamesNZL/notion-assignment-import/commit/2b28958d0142633772bea8d79f1de1e989ff4f6c))
* **interface:** :lipstick: increase `font-weight` of `.green` buttons ([4d86738](https://github.com/JamesNZL/notion-assignment-import/commit/4d86738d6ccc351d0f168d0464046d80813ca772))
* **interface:** :lipstick: increase `h3` `letter-spacing` ([600c268](https://github.com/JamesNZL/notion-assignment-import/commit/600c268d001c888e13e27d5996809ed773c7f2b2))
* **interface:** :lipstick: increase `max-height` of courses list ([88d58a1](https://github.com/JamesNZL/notion-assignment-import/commit/88d58a1e087498395a2e07d8f4c6c68cee508ebc))
* **interface:** :lipstick: increase label `letter-spacing` ([0fb7adc](https://github.com/JamesNZL/notion-assignment-import/commit/0fb7adca2a82e2708add82a974f082d406944684))
* **interface:** :lipstick: increase options `body` width ([757682b](https://github.com/JamesNZL/notion-assignment-import/commit/757682bfddccce2bb41d9a8f93b8d4dc75ee19bb))
* **interface:** :lipstick: indent popup `h2` relative to border radius ([291b28b](https://github.com/JamesNZL/notion-assignment-import/commit/291b28b55bb70c761fb7d4a96c82ccb93730437f))
* **interface:** :lipstick: left-align options page text ([1644211](https://github.com/JamesNZL/notion-assignment-import/commit/1644211701ba79cfd4c036069b38e9336fb8eb45))
* **interface:** :lipstick: lighten courses list scrollbar ([70fa841](https://github.com/JamesNZL/notion-assignment-import/commit/70fa8414bdcdcfaaf9bb56cf5281fc43dddbb529))
* **interface:** :lipstick: only bold course title and not assignment count ([465da2e](https://github.com/JamesNZL/notion-assignment-import/commit/465da2e407804be098b43006d0e4cb2513025c3f))
* **interface:** :lipstick: overhaul colour theming ([1fe5e6c](https://github.com/JamesNZL/notion-assignment-import/commit/1fe5e6cbad86b4838deb5131cfbdc7ca1f95ee2c))
* **interface:** :lipstick: prettify saved courses/assignments list ([7baa561](https://github.com/JamesNZL/notion-assignment-import/commit/7baa56103099e1cf7e7821075e44fd94b2d657c3))
* **interface:** :lipstick: reduce popup width ([9cfddbc](https://github.com/JamesNZL/notion-assignment-import/commit/9cfddbceb1942c347b1aea92502829d160463e42))
* **interface:** :lipstick: refactor interface css and re-work ui ([f1a5d3c](https://github.com/JamesNZL/notion-assignment-import/commit/f1a5d3cbb4681e80c89204d341aeeeb3936d4ef9))
* **interface:** :lipstick: remove `:` from options labels ([40bd5ce](https://github.com/JamesNZL/notion-assignment-import/commit/40bd5ce6e9a8c03b8a3910a29b0a6c6d78135e66))
* **interface:** :lipstick: replace options icon ([a76165a](https://github.com/JamesNZL/notion-assignment-import/commit/a76165ab6f9d77a012d93ca0902b4dcc0f21c2c0))
* **interface:** :lipstick: slightly darken green ([05be544](https://github.com/JamesNZL/notion-assignment-import/commit/05be54492fc69c56ee0a0f3e8ec830af8e614005))
* **interface:** :lipstick: slightly increase input indent ([2479509](https://github.com/JamesNZL/notion-assignment-import/commit/2479509ccaeb7cb0ef259f2937986b9175d52b03))
* **interface:** :lipstick: style buttons on `:focus` ([d6c65be](https://github.com/JamesNZL/notion-assignment-import/commit/d6c65be08f65327a9ff9887970e0fc978ac60867))
* **interface:** :lipstick: style headings as `uppercase` ([419a589](https://github.com/JamesNZL/notion-assignment-import/commit/419a589f57cda9bf4e24cd7655d70e5de294abf5))
* **interface:** :lipstick: swap usage of accent and complement ([e597a7a](https://github.com/JamesNZL/notion-assignment-import/commit/e597a7acb7c09495726c9e797b1f6ec33e0d8a8a))
* **interface:** :lipstick: theme segmented control ([20a043a](https://github.com/JamesNZL/notion-assignment-import/commit/20a043ac17a37fd30eccb4c90dc6ab6145ca1c01))
* **interface:** :lipstick: tweak greys ([d03f421](https://github.com/JamesNZL/notion-assignment-import/commit/d03f42111aa0f4c44db3972f5128f38f003d6446))
* **interface:** :lipstick: use flexbox to automatically fill to max height ([3d2d3e1](https://github.com/JamesNZL/notion-assignment-import/commit/3d2d3e1fb087dc9480348c9780f0d860ca081327))
* **interface:** :sparkles: add kv group for course code overrides ([64a43e5](https://github.com/JamesNZL/notion-assignment-import/commit/64a43e525566189039f94587327649f197d3280b))
* **interface:** :sparkles: add list assignments button and remove view json ([25e1e38](https://github.com/JamesNZL/notion-assignment-import/commit/25e1e38afbb13015e8d6bfb71c609909f0d3e2cc))
* **interface:** :sparkles: add tile system and overhaul greys ([ef183dd](https://github.com/JamesNZL/notion-assignment-import/commit/ef183ddc4f84ceffa18ad730c70806ae0a8ed6a8))
* **interface:** :sparkles: align all labels together ([156a751](https://github.com/JamesNZL/notion-assignment-import/commit/156a751a3ad0118540f8eeb19de248e1a5ad52a6))
* **interface:** :sparkles: dispatch `input` event on restore confirm ([24c539a](https://github.com/JamesNZL/notion-assignment-import/commit/24c539ab4f3c2d2a6d682a66c9f3b0cbf0ee10f0))
* **interface:** :sparkles: hide headings of hidden tiles ([276e293](https://github.com/JamesNZL/notion-assignment-import/commit/276e293bda4c8afd8735f39e8b36c7f99506df78))
* **interface:** :sparkles: overhaul options page ([0309b8f](https://github.com/JamesNZL/notion-assignment-import/commit/0309b8f072e4e0cc3d1b8bb0b1452155ffbeac2d))
* **interface:** :sparkles: overhaul saved assignments panel ([be58cb7](https://github.com/JamesNZL/notion-assignment-import/commit/be58cb7f7599a30bce235deaf62fd5ef68ef17ac))
* **interface:** :speech_balloon: change course code placeholder ([3d18e3a](https://github.com/JamesNZL/notion-assignment-import/commit/3d18e3a49753e9fa253d8b6a4b6e6500d1118f26))
* **interface:** :speech_balloon: change database template label ([a5d6f8a](https://github.com/JamesNZL/notion-assignment-import/commit/a5d6f8abb5549ca3aca9cb0cf9b3a063ab8563fa))
* **interface:** :speech_balloon: change headings and button labels ([2b46a39](https://github.com/JamesNZL/notion-assignment-import/commit/2b46a394dadb1e956aa9f3883fe7b1a634487bc5))
* **interface:** :speech_balloon: change saved assignments button labels ([2a5b9fe](https://github.com/JamesNZL/notion-assignment-import/commit/2a5b9fe8cae206c4ecba989d049452821f634588))
* **interface:** :speech_balloon: rename options labels ([0114229](https://github.com/JamesNZL/notion-assignment-import/commit/0114229e7e5fa4a5e31b202ca4253e34e86e9b6b))
* **interface:** :speech_balloon: use `'Untitled'` as select title fallback ([1a7ec67](https://github.com/JamesNZL/notion-assignment-import/commit/1a7ec67d206bc88fed125fc473fcb46c9c9d70c0))
* **interface:** :truck: move copy json option to advanced ([16f96ad](https://github.com/JamesNZL/notion-assignment-import/commit/16f96ad79940b0d2747f36fff4d9a328afdc457f))
* **oauth:** :construction: implement `oauth` mvp ([7a16877](https://github.com/JamesNZL/notion-assignment-import/commit/7a16877a5c8204badfe97ddfb507f49abbfa0dfe))
* **oauth:** :construction: prepare interface for oauth ([6d5ef27](https://github.com/JamesNZL/notion-assignment-import/commit/6d5ef27341aedd06eceed4cfbe1fef3c787db650))
* **oauth:** :sparkles: implement oauth through web server ([f25c9fb](https://github.com/JamesNZL/notion-assignment-import/commit/f25c9fbda0ddda539b77b8f810f160820693e468))
* **options:** :children_crossing: add link to database template ([08aede1](https://github.com/JamesNZL/notion-assignment-import/commit/08aede1978e88cc3217c37e12567a85226ad9e25))
* **options:** :children_crossing: add option to exclude non-required properties ([9884d86](https://github.com/JamesNZL/notion-assignment-import/commit/9884d868153b513408d46471fce34d6cfd6d4472))
* **options:** :children_crossing: change from confirm to undo ([46ae3bc](https://github.com/JamesNZL/notion-assignment-import/commit/46ae3bc346dd99f9ea8339f8d20d21f266d5852e))
* **options:** :children_crossing: display restore confirmation ([5247f88](https://github.com/JamesNZL/notion-assignment-import/commit/5247f887bcd2902fc25163cb27bcf40970bdb0e1))
* **options:** :children_crossing: hide database select until auth ([6ec8cf8](https://github.com/JamesNZL/notion-assignment-import/commit/6ec8cf87188ee011297f2e477d00552572d21c6d))
* **options:** :children_crossing: hide restore button if no changes ([11ce11d](https://github.com/JamesNZL/notion-assignment-import/commit/11ce11db05bd5bd62034c9f91c58a4e01e594f27))
* **options:** :children_crossing: increase restore cancel period ([ceeb7b3](https://github.com/JamesNZL/notion-assignment-import/commit/ceeb7b3e562426749c0e81290bbb74414096933b))
* **options:** :children_crossing: pre-select configured property name ([180a5bd](https://github.com/JamesNZL/notion-assignment-import/commit/180a5bd957959505fed5d57c4bbdce62e9b72c58))
* **options:** :children_crossing: remove restore undo ([bef868a](https://github.com/JamesNZL/notion-assignment-import/commit/bef868adbb96cd39c553071e1b378bdf9d009ef9))
* **options:** :construction: add dropdowns for database properties ([11c0cf7](https://github.com/JamesNZL/notion-assignment-import/commit/11c0cf72cf6f9f2f937fc29b68a4737cb5ab99ac))
* **options:** :construction: add foundation of database dropdown select ([79021d8](https://github.com/JamesNZL/notion-assignment-import/commit/79021d8f3831b81ba59de9cb0327bdeca3d10824))
* **options:** :construction: hide canvas class options ([43fd5e8](https://github.com/JamesNZL/notion-assignment-import/commit/43fd5e8677a69adaaf768edff116a14f2dd04144))
* **options:** :construction: wip re-implementation of `databaseId` ([5f82a7d](https://github.com/JamesNZL/notion-assignment-import/commit/5f82a7d1d2bb61483f377f0207f80e4cc48390e9))
* **options:** :egg: add konami code easter egg ([ceb895d](https://github.com/JamesNZL/notion-assignment-import/commit/ceb895d1fb4f8544728126a264d3b48bb9422719))
* **options:** :sparkles: add checkbox to hide copy json button ([a5472b9](https://github.com/JamesNZL/notion-assignment-import/commit/a5472b967a41539203ea9f6214a5833ab9c9d108))
* **options:** :sparkles: add database select refresh button ([502bbe3](https://github.com/JamesNZL/notion-assignment-import/commit/502bbe3f06e52235fcffeaba12a15ed904b725a8))
* **options:** :sparkles: add dropdowns for select property values ([b56cd81](https://github.com/JamesNZL/notion-assignment-import/commit/b56cd81a6faa97c356d9eaed04a33c83ca9bd140))
* **options:** :sparkles: add hiding of advanced options ([cc7e6dc](https://github.com/JamesNZL/notion-assignment-import/commit/cc7e6dc95aef4a0c1bb37a2c5ace37c18fdc0c57))
* **options:** :sparkles: add restore saved button ([7d0aa2f](https://github.com/JamesNZL/notion-assignment-import/commit/7d0aa2f55477afb2f8c96ffc15e3d55182bfc12f))
* **options:** :sparkles: complete restore saved button ([afbea89](https://github.com/JamesNZL/notion-assignment-import/commit/afbea8927dbdfe0abf96396e9899c67efef57dcf))
* **options:** :sparkles: hide `dependents` if input is empty ([b6f5f44](https://github.com/JamesNZL/notion-assignment-import/commit/b6f5f440495940c14a3e2969886a561dfd2d7189))
* **options:** :sparkles: implement restore default buttons ([045b19b](https://github.com/JamesNZL/notion-assignment-import/commit/045b19b60dbf8d50770e4386fcd5d3c81d10ba2f))
* **options:** :sparkles: use segmented control for display json button ([27e93ac](https://github.com/JamesNZL/notion-assignment-import/commit/27e93ac56f1a650ad90cbe3146ee3febd6d8683a))
* **options:** :sparkles: validate `accessToken` ([dd0aeb0](https://github.com/JamesNZL/notion-assignment-import/commit/dd0aeb022f143dc2b8196b3c866a8c75ad22b77b))
* **options:** :sparkles: validate database id on auth ([c750766](https://github.com/JamesNZL/notion-assignment-import/commit/c750766b50aa902089014640a5f1f81d2a197bf5))
* **options:** :sparkles: validate emoji input ([4c0a746](https://github.com/JamesNZL/notion-assignment-import/commit/4c0a746eed29903a0cf541151b172a48630597de))
* **options:** :sparkles: validate on restore ([35048a1](https://github.com/JamesNZL/notion-assignment-import/commit/35048a11aa43e322fdc8f3115b804f89c3c9c75e))
* **options:** :speech_balloon: shorten restore confirmation ([cec5429](https://github.com/JamesNZL/notion-assignment-import/commit/cec54291a68818e67aae80785ef3fa8038b43acf))
* **popup:** :children_crossing: change back to undo button for clear ([40a0871](https://github.com/JamesNZL/notion-assignment-import/commit/40a08713009b38f29d0cac7ed6012ba9ef0db4ff))
* **popup:** :children_crossing: ensure `databaseId` is valid ([7ae9586](https://github.com/JamesNZL/notion-assignment-import/commit/7ae95862ea2753d35e6d5ca90ab959bd52f2a9d5))
* **popup:** :lipstick: make clear button initially grey ([b9929da](https://github.com/JamesNZL/notion-assignment-import/commit/b9929da734dbc7259e06b999ced0a2bcfaae11c7))
* **popup:** :sparkles: add configure database button to popup ([2072792](https://github.com/JamesNZL/notion-assignment-import/commit/20727929d9c1e14fb5a88dde6049f2ee29d9699d))
* **popup:** :sparkles: allow passing `savedAssignments` to display function ([bc0537d](https://github.com/JamesNZL/notion-assignment-import/commit/bc0537df55cbf9121d24d77316cb1bb03b7c2a7c))
* **validator:** :sparkles: implement coupling of validators ([393b6e1](https://github.com/JamesNZL/notion-assignment-import/commit/393b6e1988f3209f6a3dc4a087da4094601964ce))


### Bug Fixes

* :bug: fix `.getInstance()` static methods ([cfe08af](https://github.com/JamesNZL/notion-assignment-import/commit/cfe08afb25aeda0edb9784384db1ecea32626f94))
* :speech_balloon: change course placeholders to be consistent ([9ba4f65](https://github.com/JamesNZL/notion-assignment-import/commit/9ba4f6501dbca5125b619d691e24345270ab992e))
* **chromium:** :lipstick: fix ghost scrollbar on `chromium` ([b7b2407](https://github.com/JamesNZL/notion-assignment-import/commit/b7b24076f6012e4c60fdad8df92ca6228600a1e0))
* **elements:** :bug: don't overwrite kv placeholders with `defaultValue` ([874d186](https://github.com/JamesNZL/notion-assignment-import/commit/874d1868f18f34708bcca4e20a1e49a21ea39c35))
* **elements:** :bug: fix computing of value input id ([33baa63](https://github.com/JamesNZL/notion-assignment-import/commit/33baa63ab34b5f3f34ebf3986a60dd40d9bcce4f))
* **elements:** :bug: fix label selector ([7a612bb](https://github.com/JamesNZL/notion-assignment-import/commit/7a612bb636fa5276419c87521e7303aa07666ee3))
* **elements:** :bug: fix search for parent `.tile` ([009e7f7](https://github.com/JamesNZL/notion-assignment-import/commit/009e7f753e8ea215448322825d9823b9a3692a3a))
* **elements:** :bug: fix show/hide of parent headings ([8d7495b](https://github.com/JamesNZL/notion-assignment-import/commit/8d7495bf5d712ef0486e948bd09736d7a53ad0f9))
* **elements:** :bug: only update value input if all inputs are valid ([9b8e720](https://github.com/JamesNZL/notion-assignment-import/commit/9b8e7206a5d47062e077a80c965c34cfcf002dc2))
* **elements:** :bug: use `'change'` listener to avoid premature processing ([1484b36](https://github.com/JamesNZL/notion-assignment-import/commit/1484b36b12c6f900e772b5d6f4845e17d8ef6fa3))
* **elements:** :construction: only add new row if no other empty ones ([321b4ee](https://github.com/JamesNZL/notion-assignment-import/commit/321b4ee7f81b443990aef82a4129331875fd6fa1))
* **elements:** :rotating_light: fix import path ([c2203d1](https://github.com/JamesNZL/notion-assignment-import/commit/c2203d154a9e80847de6b35c6600540f18cadf23))
* **firefox:** :bug: remove `href` to options page ([96aa7dc](https://github.com/JamesNZL/notion-assignment-import/commit/96aa7dc29b85c0850bb64cf68caef36ffaa2e600))
* **firefox:** :lipstick: fix display of 'required' * ([0a8c242](https://github.com/JamesNZL/notion-assignment-import/commit/0a8c242d8f49f12facd442dde46e7cc6f1cbe59c))
* **import:** :bug: fix rate limit handler ([c0f7f6e](https://github.com/JamesNZL/notion-assignment-import/commit/c0f7f6ea6db076b7702083442e3dc8e9abc789eb))
* **interface:** :bug: ensure `.emphasis` is always applied ([5e1cd5d](https://github.com/JamesNZL/notion-assignment-import/commit/5e1cd5da0ced68cff5f66b65f7db8a3bf1183e71))
* **interface:** :bug: fix another bug from 26c3e74 ([ec7d6c4](https://github.com/JamesNZL/notion-assignment-import/commit/ec7d6c48db9421b4e66d6e07c10b64a51036297c))
* **interface:** :bug: fix overwriting of button icon ([4a9182c](https://github.com/JamesNZL/notion-assignment-import/commit/4a9182c0acb848d3a7522cbc6963b2ceaa808d4c))
* **interface:** :bug: fix save button confirmation ([85e4519](https://github.com/JamesNZL/notion-assignment-import/commit/85e4519ebf55ef26ac45721480dfe494bc6a3b0f))
* **interface:** :bug: indent validating/error messages ([31e4244](https://github.com/JamesNZL/notion-assignment-import/commit/31e4244b688d0bf48f1ef908bbc67a4f279a42e8))
* **interface:** :bug: proper fix for ec7d6c4 ([e8fc8e3](https://github.com/JamesNZL/notion-assignment-import/commit/e8fc8e3a41b9c2f39a4aa95157c0b1ec4d615c38))
* **interface:** :bug: properly display active state on restore ([cf42c0a](https://github.com/JamesNZL/notion-assignment-import/commit/cf42c0ad15e43d1480a7d3d122e2404b6ae512de))
* **interface:** :bug: use `id` as fallback if no resolved title ([9893639](https://github.com/JamesNZL/notion-assignment-import/commit/9893639b84102af1f4d5c6dfd94e0399233a0845))
* **interface:** :children_crossing: do not show dependents if hidden ([a5290d8](https://github.com/JamesNZL/notion-assignment-import/commit/a5290d8730db5bb3d21d6bf761d05c5ad645cd68))
* **interface:** :children_crossing: fix display of loading placeholder ([9e22da2](https://github.com/JamesNZL/notion-assignment-import/commit/9e22da28f9934c1bca8eb6d3be72511259429ab6))
* **interface:** :children_crossing: ignore hidden inputs for restore button display ([231143e](https://github.com/JamesNZL/notion-assignment-import/commit/231143ed358403b9b6846a457140491a7bfac847))
* **interface:** :construction: hide `.key-value-input` directly ([a86a16c](https://github.com/JamesNZL/notion-assignment-import/commit/a86a16caf381d1dd78ee04bf3285393f52b62fa8))
* **interface:** :lipstick: account for border in outline button padding ([bf192aa](https://github.com/JamesNZL/notion-assignment-import/commit/bf192aa7a489f0b323f0ad24cb68f017dfcf5e2f))
* **interface:** :lipstick: ensure options width is not larger than `vw` ([4445d2c](https://github.com/JamesNZL/notion-assignment-import/commit/4445d2cc562bda89c439535de0e91f5596db448a))
* **interface:** :lipstick: fix spacing beneath `.segmented-control` ([b510aa8](https://github.com/JamesNZL/notion-assignment-import/commit/b510aa8b339ed0d9d418e0538a5e41b87ed09b87))
* **interface:** :lipstick: fix styling of `.tile select` ([5707097](https://github.com/JamesNZL/notion-assignment-import/commit/570709738cb777f0e57daf7eb591c124dad8c305))
* **interface:** :lipstick: fix styling of validation messages ([8f3d1c9](https://github.com/JamesNZL/notion-assignment-import/commit/8f3d1c9c478972ce05f28db8eae984b218fa0e76))
* **interface:** :lipstick: fix vertical overflow on smaller screens ([6d3adea](https://github.com/JamesNZL/notion-assignment-import/commit/6d3adea8d829ef10ce77ea8ef5388a84925e3df3))
* **interface:** :lipstick: increase `letter-spacing` ([0ccfed7](https://github.com/JamesNZL/notion-assignment-import/commit/0ccfed7ebfd31259d7f3f152254aa34f2153e95d))
* **interface:** :lipstick: increase `max-height` of courses list ([a81331e](https://github.com/JamesNZL/notion-assignment-import/commit/a81331eef01db3f5f88abdaf75d808f8e2e818f7))
* **interface:** :lipstick: move `br` tag ([3ed08a3](https://github.com/JamesNZL/notion-assignment-import/commit/3ed08a37f997ed985a02c3d88e77281264cffc3b))
* **interface:** :lipstick: reduce excess margin below courses list ([94efd78](https://github.com/JamesNZL/notion-assignment-import/commit/94efd786e03a52b95b364485b8151dba5f5a3cb4))
* **interface:** :lipstick: reduce popup `margin-top` ([f8764db](https://github.com/JamesNZL/notion-assignment-import/commit/f8764db734e32cf814f50df13d14a2c1b0722564))
* **interface:** :lipstick: remove `color` transition ([b0ebab4](https://github.com/JamesNZL/notion-assignment-import/commit/b0ebab48016d6fc53ef8f5be0f77026c2306272c))
* **interface:** :lipstick: remove `red-hover` on restore saved ([634deb7](https://github.com/JamesNZL/notion-assignment-import/commit/634deb7bd014f326d28657a4310689cdd5cdab03))
* **interface:** :lipstick: use `:focus-visible` for less buggy behaviour ([5112071](https://github.com/JamesNZL/notion-assignment-import/commit/511207121bb5c95bf19b6fd1fb63cb40efd60365))
* **interface:** :lipstick: use `unset` for outline background colour ([f28783e](https://github.com/JamesNZL/notion-assignment-import/commit/f28783eb49be0460e2db24ac5d83c9be2b875550))
* **interface:** :speech_balloon: fix 'imported 1 assignments' ([b8ddfe2](https://github.com/JamesNZL/notion-assignment-import/commit/b8ddfe2aa1ba708a3b0738b38a25936f33c37b14))
* **interface:** :speech_balloon: fix github capitalisation ([ffa35a1](https://github.com/JamesNZL/notion-assignment-import/commit/ffa35a1bb0ebf426ca8cc074a97f6bbafa8f0756))
* **interface:** :speech_balloon: fix restore saved button label ([4a2aa30](https://github.com/JamesNZL/notion-assignment-import/commit/4a2aa3043735d41f4ac1ba8c8e94ed2e5b172757))
* **interface:** :speech_balloon: fix singlequotes in `JSON` examples ([c58e887](https://github.com/JamesNZL/notion-assignment-import/commit/c58e88736c1231ab31289d159445159b0d525034))
* **interface:** hide restore button if appropriate on input hide ([5ba0772](https://github.com/JamesNZL/notion-assignment-import/commit/5ba0772589474d7926e9b2094e64f82c20435221))
* **notion:** :bug: call `method` with `this` ([db4ce24](https://github.com/JamesNZL/notion-assignment-import/commit/db4ce24d0831b556c4ddea6f6a4193bee74610e6))
* **notion:** :zap: fix object map keys failing reference equality ([46d2484](https://github.com/JamesNZL/notion-assignment-import/commit/46d2484e9e44711223c64dbc0e7833ba6bff7b2e))
* **oauth:** :bug: throw error if returned query is `'undefined'` ([dbff700](https://github.com/JamesNZL/notion-assignment-import/commit/dbff700b2c29bc79d174f2fd4590902faa67492b))
* **options:** :bug: allow restoring of `null` values ([616a60d](https://github.com/JamesNZL/notion-assignment-import/commit/616a60d0522b36e85086602f36acccacbd5a074a))
* **options:** :bug: always dispatch `input` event on `Input#setValue` ([b639ecf](https://github.com/JamesNZL/notion-assignment-import/commit/b639ecfb3dae97d7f4d9c314c808413afa3ddc47))
* **options:** :bug: completely replace database list on `populate()` ([c263299](https://github.com/JamesNZL/notion-assignment-import/commit/c2632992e874481702d7efc712fdb6fbfab21bd0))
* **options:** :bug: display/hide advanced options on undo ([4730082](https://github.com/JamesNZL/notion-assignment-import/commit/4730082e644d0fe773b34b7e37e0d1aa3be643af))
* **options:** :bug: fix error if default value is `null` ([276234c](https://github.com/JamesNZL/notion-assignment-import/commit/276234c4934ddff8bea7c53f64eedd1b59e8f4c3))
* **options:** :bug: fix stack overflow ([fe185c8](https://github.com/JamesNZL/notion-assignment-import/commit/fe185c833c10fc9b6f6d1a24e71d9a2a9a218ab7))
* **options:** :bug: hide dependents on load if appropriate ([29de542](https://github.com/JamesNZL/notion-assignment-import/commit/29de542503e4bcece8b2d0ea025e56b942b2f6cf))
* **options:** :bug: hide restore saved button on save ([d4a15ed](https://github.com/JamesNZL/notion-assignment-import/commit/d4a15edeac8a843e079c02b35e9e80c9b8438e64))
* **options:** :bug: re-validate on captured restore too ([1160887](https://github.com/JamesNZL/notion-assignment-import/commit/11608877bb5115b2c80dfadaa40d1af05f6acb22))
* **options:** :children_crossing: toggle restore saved button after select populate ([d0dbe2b](https://github.com/JamesNZL/notion-assignment-import/commit/d0dbe2b5e1921d19eed1edf94468910a9f94b42d))
* **options:** :egg: fix konami code result ([4a13128](https://github.com/JamesNZL/notion-assignment-import/commit/4a1312837d9482e2f3a17c47c17b130695dd583c))
* **options:** :label: use `SupportedTypes` ([44fae93](https://github.com/JamesNZL/notion-assignment-import/commit/44fae933d00dd134f4dd7453634509a1bae2fc87))
* **options:** :loud_sound: fix class names in errors ([b58ce01](https://github.com/JamesNZL/notion-assignment-import/commit/b58ce01ce223a736f84acf876fab7b928b35b921))
* **popup:** :bug: clear existing `resetHTML` timeouts first ([92bdc45](https://github.com/JamesNZL/notion-assignment-import/commit/92bdc4570588de11e9806989ebf93fcfb4732190))
* **popup:** :bug: fix courses list updates never enabling after clear ([bfa6f2c](https://github.com/JamesNZL/notion-assignment-import/commit/bfa6f2ccb3be1f1ac2d07d49787f787cc9d228f4))
* **popup:** :bug: fix options `href` ([c135630](https://github.com/JamesNZL/notion-assignment-import/commit/c135630c7b731e2733652894b304d6bb23253a4b))
* **popup:** :bug: use getters to prevent invalid id errors ([3d2c8c7](https://github.com/JamesNZL/notion-assignment-import/commit/3d2c8c7c5917e9c14d7b058cbbc23ae4cfe14abb))
* **popup:** :children_crossing: alert before button label update ([2c9fa40](https://github.com/JamesNZL/notion-assignment-import/commit/2c9fa40e86a4786e8641d71c6a3d62d96bb87d23))
* **popup:** :lipstick: enable list updates on clear ([b0fd99c](https://github.com/JamesNZL/notion-assignment-import/commit/b0fd99c0aedf38ab4c881b026f2ddf2fce8ee621))
* **popup:** :speech_balloon: fix '1 assignments' ([e54a490](https://github.com/JamesNZL/notion-assignment-import/commit/e54a490f4fdc31dfbe54d89be69984cda41b6708))
* **storage:** :bug: fix empty return object ([f40b9d1](https://github.com/JamesNZL/notion-assignment-import/commit/f40b9d1dd744d9f30a9d45e2e4bc55806a79f234))
* **stylesheet:** :ambulance: fix errors from a7031e7 ([a59fabe](https://github.com/JamesNZL/notion-assignment-import/commit/a59fabebf9e36aa3a5a439472cea2a174ccc1250))
* **stylesheet:** :lipstick: fix alignment of active label `:before` ([fec1d57](https://github.com/JamesNZL/notion-assignment-import/commit/fec1d57dec4c662847cefd598837b076a7a9f53a))
* **validator:** :alien: strictly define emojis accepted by notion api ([b5b128a](https://github.com/JamesNZL/notion-assignment-import/commit/b5b128a8461f15497e49381d95a08f8eb994bdbd))
* **validator:** :bug: assign unique ids to kv inputs ([f612ee7](https://github.com/JamesNZL/notion-assignment-import/commit/f612ee71a76a61a615117cbe998097c429653cb9))
* **validator:** :bug: avoid infinite loops ([1da52ac](https://github.com/JamesNZL/notion-assignment-import/commit/1da52ac298beb8e15f05098504119e70b8e39cfc))
* **validator:** :bug: bind `this` to `typeGuards` ([4d07705](https://github.com/JamesNZL/notion-assignment-import/commit/4d07705bf00341fa94009fe7d820a3e402fe4dbc))
* **validator:** :bug: fix count of invalid validators when coupled ([6ad109f](https://github.com/JamesNZL/notion-assignment-import/commit/6ad109f47789fd0e259c36eaa636a8131eebf08c))
* **validator:** :bug: fix duplicate nested status/error elements ([ead331d](https://github.com/JamesNZL/notion-assignment-import/commit/ead331d6ab629d01588882ba1832c140d30f5d2f))
* **validator:** :bug: fix error messages of invalid coupled validators ([04a343b](https://github.com/JamesNZL/notion-assignment-import/commit/04a343bd801333877d1d03dcadfab675867e8925))

### [3.0.6](https://github.com/JamesNZL/notion-assignment-import/compare/v3.0.5...v3.0.6) (2022-06-14)


### Bug Fixes

* **interface:** :lipstick: fix `width` of `body` on options page ([1787086](https://github.com/JamesNZL/notion-assignment-import/commit/17870869446147de696f3080848523b5e38081c2))

### [3.0.5](https://github.com/JamesNZL/notion-assignment-import/compare/v3.0.4...v3.0.5) (2022-06-14)


### Bug Fixes

* **firefox:** :alien: add support for `tabs.executeScript()` for `mv2` ([718f425](https://github.com/JamesNZL/notion-assignment-import/commit/718f425e79cab45c1102e0a2a5acff94fda914f8))
* **firefox:** :lipstick: inherit `body` `width` ([bc5b50f](https://github.com/JamesNZL/notion-assignment-import/commit/bc5b50f6a50ce953868dd7bf68b42f1f78b1ccdb))
* **firefox:** :lipstick: set `font-size` explicitly ([66632b5](https://github.com/JamesNZL/notion-assignment-import/commit/66632b5e04220d55c9250eeb9fde6daa26996e36))
* **firefox:** :recycle: use `browser` namespace to fix firefox bugs ([e5517c4](https://github.com/JamesNZL/notion-assignment-import/commit/e5517c428261fcfb12958d297a021fe7374c266a))
* **interface:** :lipstick: directly set `width` style on `body` ([ef4d10b](https://github.com/JamesNZL/notion-assignment-import/commit/ef4d10bd89634dd1a489b8afdf56c2d126b419c8))
* **interface:** :lipstick: explicitly define `font-family` ([75f49c4](https://github.com/JamesNZL/notion-assignment-import/commit/75f49c43cdddeaa92ee993a02d8790f7a4b1eede))
* **manifest:** :wrench: fix invalid manifest `v2` fields ([b6c7339](https://github.com/JamesNZL/notion-assignment-import/commit/b6c7339a689bca8ee5fc2115cf21eba080936641))
* **popup:** :truck: fix path to `parse.js` ([52b0a78](https://github.com/JamesNZL/notion-assignment-import/commit/52b0a78f7ca00b9a327226b511e23e7370a56cae))

### [3.0.4](https://github.com/JamesNZL/notion-assignment-import/compare/v3.0.3...v3.0.4) (2022-06-13)


### Build System

* **release:** :sparkles: support multiple vendors ([b39a96e](https://github.com/JamesNZL/notion-assignment-import/commit/b39a96ea1609e191a8d944f07f216f06e983b871))

### [3.0.3](https://github.com/JamesNZL/notion-assignment-import/compare/v3.0.2...v3.0.3) (2022-06-13)


### Bug Fixes

* **gulp:** :package: fix double zipping of `_latest.zip` ([d0c0409](https://github.com/JamesNZL/notion-assignment-import/commit/d0c0409dd9c23488c5fa34658546d671bcdd7a33))
* **types:** :rotating_light: fix `ts(2526)` error ([b15d502](https://github.com/JamesNZL/notion-assignment-import/commit/b15d50299327262bb3ee62c1a4351d8aa6de0738))

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
