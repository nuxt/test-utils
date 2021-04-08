# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.2](https://github.com/nuxt-community/module-test-utils/compare/v0.2.1...v0.2.2) (2021-04-08)


### Features

* resolve rootDir ([#107](https://github.com/nuxt-community/module-test-utils/issues/107)) ([f604dff](https://github.com/nuxt-community/module-test-utils/commit/f604dff709bc523c93f1f17db7a972d5a5252c03))

### [0.2.1](https://github.com/nuxt-community/module-test-utils/compare/v0.2.0...v0.2.1) (2021-04-01)


### Bug Fixes

* detect `nuxt.config` with different extensions ([#105](https://github.com/nuxt-community/module-test-utils/issues/105)) ([006bebf](https://github.com/nuxt-community/module-test-utils/commit/006bebf4391487aa8186dd6e7e4b3813a7d93f8f))
* **types:** add more type definitions to nuxt interface ([#106](https://github.com/nuxt-community/module-test-utils/issues/106)) ([1a7d223](https://github.com/nuxt-community/module-test-utils/commit/1a7d223905729baf0eb15555c24fadfb5c072ee4))

## [0.2.0](https://github.com/nuxt-community/module-test-utils/compare/v0.1.3...v0.2.0) (2021-03-06)


### ⚠ BREAKING CHANGES

* use loadNuxtConfig

### Features

* add generated assertions ([#94](https://github.com/nuxt-community/module-test-utils/issues/94)) ([cc90f6b](https://github.com/nuxt-community/module-test-utils/commit/cc90f6b6935ec75921983214423cb0d4056c6007))
* mockConsola ([#91](https://github.com/nuxt-community/module-test-utils/issues/91)) ([c8e7940](https://github.com/nuxt-community/module-test-utils/commit/c8e7940f997038abcc767533674e8c27007046a2))
* use loadNuxtConfig ([111ec67](https://github.com/nuxt-community/module-test-utils/commit/111ec67d729edc404f14a54231479f567ba3f9a2)), closes [#87](https://github.com/nuxt-community/module-test-utils/issues/87)


### Bug Fixes

* add missing @babel/preset-typescript dependency ([#93](https://github.com/nuxt-community/module-test-utils/issues/93)) ([8edf5c9](https://github.com/nuxt-community/module-test-utils/commit/8edf5c9b965dad96b44a0116169ab760db32273b))

### [0.1.3](https://github.com/nuxt-community/module-test-utils/compare/v0.1.2...v0.1.3) (2021-02-08)


### Bug Fixes

* **server:** try to use `config.server.port` ([#84](https://github.com/nuxt-community/module-test-utils/issues/84)) ([b017f8a](https://github.com/nuxt-community/module-test-utils/commit/b017f8adcc3eda41997b4582b25f2d5bb6d63fdd))

### [0.1.2](https://github.com/nuxt-community/module-test-utils/compare/v0.1.1...v0.1.2) (2020-12-15)


### Bug Fixes

* fix exported jest preset with node target ([66b9a88](https://github.com/nuxt-community/module-test-utils/commit/66b9a88a390b609ffc04c3aefa451e07c3c5e079))

### 0.1.1 (2020-12-15)


### Features

* add `init` helper ([0472396](https://github.com/nuxt-community/module-test-utils/commit/04723963d079228ad6298d4b1b1126312b284256))
* add negative assertions ([#57](https://github.com/nuxt-community/module-test-utils/issues/57)) ([0a5e206](https://github.com/nuxt-community/module-test-utils/commit/0a5e206fb2054c8794e20481567cd119bc3bf6c8))
* add option `beforeNuxtReady` ([8ed04e7](https://github.com/nuxt-community/module-test-utils/commit/8ed04e792e97afddda08660375b28233cc8a6375))
* add option `override` to `loadConfig` ([778cb07](https://github.com/nuxt-community/module-test-utils/commit/778cb0707164a439346ba1d05b69a36f595bcb34))
* add option `waitFor` ([0e787e3](https://github.com/nuxt-community/module-test-utils/commit/0e787e3a032948305f603d5a0dfcb450b96f3c2a))
* add options parameter on get function ([bf6dd20](https://github.com/nuxt-community/module-test-utils/commit/bf6dd200657e366820b04223deb1285a0027bc1d))
* add parameter `options` ([da04ea4](https://github.com/nuxt-community/module-test-utils/commit/da04ea4e1ed2d08faf763f92786a270b59ddb432))
* allow merging config overrides in loadConfig ([#2](https://github.com/nuxt-community/module-test-utils/issues/2)) ([ad61aef](https://github.com/nuxt-community/module-test-utils/commit/ad61aef7533effc320acf3ae9e5a7e760ed7819b)), closes [#1](https://github.com/nuxt-community/module-test-utils/issues/1)
* create jest preset ([#60](https://github.com/nuxt-community/module-test-utils/issues/60)) ([5bf4305](https://github.com/nuxt-community/module-test-utils/commit/5bf4305d2807257bb85ffeae36c23b0089ee36ee))
* custom browser ([#25](https://github.com/nuxt-community/module-test-utils/issues/25)) ([3e18e35](https://github.com/nuxt-community/module-test-utils/commit/3e18e35907023b57904d4c40b0491517c3532a4f))
* ensure puppeteer is installed ([#42](https://github.com/nuxt-community/module-test-utils/issues/42)) ([bc6d1e6](https://github.com/nuxt-community/module-test-utils/commit/bc6d1e6fa5b3b14da76489190647746f9f6b56a6))
* generate port ([#9](https://github.com/nuxt-community/module-test-utils/issues/9)) ([4940bd2](https://github.com/nuxt-community/module-test-utils/commit/4940bd2b836adce123be386664ac93b81007dc9c))
* inject `builder` and `generator` ([6818cce](https://github.com/nuxt-community/module-test-utils/commit/6818cced3f62be1086091e9c61de47cb22ec82ff))
* keep internal context ([#51](https://github.com/nuxt-community/module-test-utils/issues/51)) ([7f09991](https://github.com/nuxt-community/module-test-utils/commit/7f0999168c1d1dd3f734a7ff5a7dbd95c59d48e9))
* migrate to playwright ([#54](https://github.com/nuxt-community/module-test-utils/issues/54)) ([d82102d](https://github.com/nuxt-community/module-test-utils/commit/d82102dfaebc876098551963a424f8250b94ca64))
* request helper ([#39](https://github.com/nuxt-community/module-test-utils/issues/39)) ([7949aad](https://github.com/nuxt-community/module-test-utils/commit/7949aad900f47506c903abd5da7429b956b42a61))


### Bug Fixes

* **jest:** use node: current as target ([2f6efc8](https://github.com/nuxt-community/module-test-utils/commit/2f6efc8ebfd9432cb7dc68e407deac89c224b227))
* **setup:** listen before generate ([87aeb9a](https://github.com/nuxt-community/module-test-utils/commit/87aeb9a60abf372519db45faee87f5565415bf8c)), closes [#64](https://github.com/nuxt-community/module-test-utils/issues/64)
* use random `buildDir` to avoid conflicts ([#53](https://github.com/nuxt-community/module-test-utils/issues/53)) ([b627493](https://github.com/nuxt-community/module-test-utils/commit/b62749305d78d6c023f0c760fc8a8533df379fb7))
* **types:** correct types of get method options ([#22](https://github.com/nuxt-community/module-test-utils/issues/22)) ([f80d07a](https://github.com/nuxt-community/module-test-utils/commit/f80d07a98afb9c07f619ec9e1831b697faffc0cd))
* **types:** include types in published package ([#20](https://github.com/nuxt-community/module-test-utils/issues/20)) ([511a9fe](https://github.com/nuxt-community/module-test-utils/commit/511a9fe7fcfee06c69f1cef60e4b1e5eb4d8fd16))
* don't allow mutating original config object by the caller ([#5](https://github.com/nuxt-community/module-test-utils/issues/5)) ([642cd1b](https://github.com/nuxt-community/module-test-utils/commit/642cd1b53f1d762a795ab551f8e19de7ea28bd36))
* pass options as second paramter ([b3386ed](https://github.com/nuxt-community/module-test-utils/commit/b3386ede653e7ca4efa0fb8a7a40024f0c364d26))
* use `request-promise-native` ([982e562](https://github.com/nuxt-community/module-test-utils/commit/982e562529341f777aae7383ab5f90c31d8eec17))
* waitFor ([6f3dd54](https://github.com/nuxt-community/module-test-utils/commit/6f3dd543af7f1aee594d6365700615b8b1f52651))

### [0.0.1](https://github.com/nuxt-community/module-test-utils/compare/v2.0.0-3...v0.0.1) (2020-10-02)


### Features

* create jest preset ([#60](https://github.com/nuxt-community/module-test-utils/issues/60)) ([5bf4305](https://github.com/nuxt-community/module-test-utils/commit/5bf4305d2807257bb85ffeae36c23b0089ee36ee))


### Bug Fixes

* **setup:** listen before generate ([87aeb9a](https://github.com/nuxt-community/module-test-utils/commit/87aeb9a60abf372519db45faee87f5565415bf8c)), closes [#64](https://github.com/nuxt-community/module-test-utils/issues/64)
