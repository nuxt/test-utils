---
title: Setup
description: Setting up your Nuxt test environment
position: 10
version: 1
category: Writing tests
---

## Setting up the test context

In each describe block where you are taking advantage of the `@nuxt/test-utils` helper methods, you will need to set up the test context before beginning.

```js
import { setupTest } from '@nuxt/test-utils'

describe('My test', () => {
  setupTest({
    // test context options
  })

  test('my test', () => {
    // ...
  })
})
```

Behind the scenes, `setupTest` performs a number of tasks in `beforeEach`, `afterEach` and `afterAll` to setup the Nuxt test environment correctly. It also adds a single Nuxt setup task as an additional test. This means it must be run within the describe block of a test, before any other calls to `test` or `it`. 

<alert type="warning">

Using `test.only` or `it.only` later in the describe block of your test will cause the tests to fail.

</alert>

## Options for `setupTest`

### Nuxt configuration

#### rootDir

Path to a directory with a Nuxt app to be put under test.

* Type: `string`
* Default: `'.'`

#### configFile

Name of the configuration file.

* Type: `string`
* Default: `'nuxt.config.js' | 'nuxt.config.ts'`

#### config

Object with configuration overrides.

* Type: `NuxtConfig`
* Default: `{}`

### Build directory

#### randomBuildDir

To avoid conflicts between concurrent tests, a new random [build directory](https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-builddir) will be created each time `setupTest` is called.

* Type: `boolean`
* Default: `true` (ignored if [`build`](#build) step is not enabled)

#### randomPort

The test server will listen on a new random port each time `setupTest` is called. If disabled, the server will try to use [`server.port`](https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-server) value.

* Type: `boolean`
* Default: `true` (ignored if [`server`](#server) is not enabled)

### Setup timings

#### setupTimeout

The amount of time (in milliseconds) to allow for `setupTest` to complete its work (which could include building or generating files for a Nuxt application, depending on the options that are passed).

* Type: `number`
* Default: `60000`

#### waitFor

An additional aount of time (in milliseconds) to wait after setting up the test context before commencing the rest of the test suite.

* Type: `number`
* Default: `0`

### Features to enable

#### build

Whether to run a separate build step.

* Type: `boolean`
* Default: `true`

#### server

Whether to launch a server to respond to requests in the test suite.

* Type: `boolean`
* Default: `false`
  
#### generate

Whether to run generate pre-rendered HTML files for the application.

* Type: `boolean`
* Default: `false`
  
#### browser

Under the hood, Nuxt test utils uses [`playwright`](https://playwright.dev/) to carry out browser testing. If this option is set, a browser will be launched and can be controlled in the subsequent test suite. (More info can be found [here](/api-reference/browser-testing).)

* Type: `boolean`
* Default: `false`

#### browserOptions
* Type: `object` with the following properties
  - **type**: The type of browser to launch - either `chromium`, `firefox` or `webkit`
  - **launch**: `object` of options that will be passed to playwright when launching the browser. See [full API reference](https://playwright.dev/#version=master&path=docs%2Fapi.md&q=browsertypelaunchoptions).
  