# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0-3](https://github.com/nuxt-community/module-test-utils/compare/v2.0.0-2...v2.0.0-3) (2020-08-19)


### Features

* add negative assertions ([#57](https://github.com/nuxt-community/module-test-utils/issues/57)) ([0a5e206](https://github.com/nuxt-community/module-test-utils/commit/0a5e206fb2054c8794e20481567cd119bc3bf6c8))
* migrate to playwright ([#54](https://github.com/nuxt-community/module-test-utils/issues/54)) ([d82102d](https://github.com/nuxt-community/module-test-utils/commit/d82102dfaebc876098551963a424f8250b94ca64))


### Bug Fixes

* use random `buildDir` to avoid conflicts ([#53](https://github.com/nuxt-community/module-test-utils/issues/53)) ([b627493](https://github.com/nuxt-community/module-test-utils/commit/b62749305d78d6c023f0c760fc8a8533df379fb7))

## [2.0.0-2](https://github.com/nuxt-community/module-test-utils/compare/v2.0.0-1...v2.0.0-2) (2020-08-09)


### Features

* ensure puppeteer is installed ([#42](https://github.com/nuxt-community/module-test-utils/issues/42)) ([bc6d1e6](https://github.com/nuxt-community/module-test-utils/commit/bc6d1e6fa5b3b14da76489190647746f9f6b56a6))
* keep internal context ([#51](https://github.com/nuxt-community/module-test-utils/issues/51)) ([7f09991](https://github.com/nuxt-community/module-test-utils/commit/7f0999168c1d1dd3f734a7ff5a7dbd95c59d48e9))
* request helper ([#39](https://github.com/nuxt-community/module-test-utils/issues/39)) ([7949aad](https://github.com/nuxt-community/module-test-utils/commit/7949aad900f47506c903abd5da7429b956b42a61))

## [2.0.0-1](https://github.com/nuxt-community/module-test-utils/compare/v2.0.0-0...v2.0.0-1) (2020-08-04)

## [2.0.0-0](https://github.com/nuxt-community/module-test-utils/compare/v1.6.3...v2.0.0-0) (2020-08-04)


### Features

* custom browser ([#25](https://github.com/nuxt-community/module-test-utils/issues/25)) ([3e18e35](https://github.com/nuxt-community/module-test-utils/commit/3e18e35907023b57904d4c40b0491517c3532a4f))

### [1.6.3](https://github.com/nuxt-community/module-test-utils/compare/v1.6.2...v1.6.3) (2020-07-01)


### Bug Fixes

* **types:** correct types of get method options ([#22](https://github.com/nuxt-community/module-test-utils/issues/22)) ([f80d07a](https://github.com/nuxt-community/module-test-utils/commit/f80d07a98afb9c07f619ec9e1831b697faffc0cd))

### [1.6.2](https://github.com/nuxt-community/module-test-utils/compare/v1.6.1...v1.6.2) (2020-06-30)


### Bug Fixes

* **types:** include types in published package ([#20](https://github.com/nuxt-community/module-test-utils/issues/20)) ([511a9fe](https://github.com/nuxt-community/module-test-utils/commit/511a9fe7fcfee06c69f1cef60e4b1e5eb4d8fd16))

### [1.6.1](https://github.com/nuxt-community/module-test-utils/compare/v1.6.0...v1.6.1) (2020-03-17)


### Bug Fixes

* use `request-promise-native` ([982e562](https://github.com/nuxt-community/module-test-utils/commit/982e562529341f777aae7383ab5f90c31d8eec17))

## [1.6.0](https://github.com/nuxt-community/module-test-utils/compare/v1.5.0...v1.6.0) (2020-03-16)


### Features

* add types for typescript support ([2f42426](https://github.com/nuxt-community/module-test-utils/commit/2f42426))

## [1.5.0](https://github.com/nuxt-community/module-test-utils/compare/v1.4.0...v1.5.0) (2019-10-29)


### Features

* generate port ([#9](https://github.com/nuxt-community/module-test-utils/issues/9)) ([4940bd2](https://github.com/nuxt-community/module-test-utils/commit/4940bd2))

## [1.4.0](https://github.com/nuxt-community/module-test-utils/compare/v1.3.1...v1.4.0) (2019-10-23)


### Features

* add option `beforeNuxtReady` ([8ed04e7](https://github.com/nuxt-community/module-test-utils/commit/8ed04e7))

### [1.3.1](https://github.com/nuxt-community/module-test-utils/compare/v1.3.0...v1.3.1) (2019-10-15)


### Bug Fixes

* don't allow mutating original config object by the caller ([#5](https://github.com/nuxt-community/module-test-utils/issues/5)) ([642cd1b](https://github.com/nuxt-community/module-test-utils/commit/642cd1b))

## [1.3.0](https://github.com/nuxt-community/module-test-utils/compare/v1.2.0...v1.3.0) (2019-08-26)


### Features

* allow merging config overrides in loadConfig ([#2](https://github.com/nuxt-community/module-test-utils/issues/2)) ([ad61aef](https://github.com/nuxt-community/module-test-utils/commit/ad61aef)), closes [#1](https://github.com/nuxt-community/module-test-utils/issues/1)

## [1.2.0](https://github.com/nuxt-community/module-test-utils/compare/v1.1.0...v1.2.0) (2019-08-20)


### Bug Fixes

* pass options as second paramter ([b3386ed](https://github.com/nuxt-community/module-test-utils/commit/b3386ed))


### Features

* add `init` helper ([0472396](https://github.com/nuxt-community/module-test-utils/commit/0472396))
* add option `override` to `loadConfig` ([778cb07](https://github.com/nuxt-community/module-test-utils/commit/778cb07))

## [1.1.0](https://github.com/nuxt-community/module-test-utils/compare/v1.0.0...v1.1.0) (2019-08-20)


### Bug Fixes

* waitFor ([6f3dd54](https://github.com/nuxt-community/module-test-utils/commit/6f3dd54))


### Features

* add option `waitFor` ([0e787e3](https://github.com/nuxt-community/module-test-utils/commit/0e787e3))
* add parameter `options` ([da04ea4](https://github.com/nuxt-community/module-test-utils/commit/da04ea4))

# [1.0.0](https://github.com/nuxt-community/module-test-utils/compare/v0.0.1...v1.0.0) (2019-08-08)


### Features

* add options parameter on get function ([bf6dd20](https://github.com/nuxt-community/module-test-utils/commit/bf6dd20))



## 0.0.1 (2019-07-31)


### Features

* inject `builder` and `generator` ([6818cce](https://github.com/nuxt-community/module-test-utils/commit/6818cce))
