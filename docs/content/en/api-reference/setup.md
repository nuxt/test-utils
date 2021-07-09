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

### Paths and Nuxt configuration

#### configFile

The name of the Nuxt configuration file that will be read to get the configuration for the tests.

* Type: `string`
* Default: `'nuxt.config.js' | 'nuxt.config.ts'`

#### config

You can override Nuxt options when running tests using this option.

* Type: `NuxtConfig`
* Default: `{}`

#### testDir

The parent directory for the test fixture.

* Type: `string`
* Default: `'~~/test'`
  
#### fixture

(For module or library testing) specifies the name of a fixture directory (under `testDir`) containing a Nuxt app.

* Type: `string`
* Default: `'fixture'`
  
#### rootDir

The path to the Nuxt application that will be used in the tests.

* Type: `string`
* Default: `<testDir>/<fixture>`

### Build directory

`setupTest` will create a random build directory to avoid race conditions and conflicts between tests which run in parallel. The default template is: `<rootDir>/.nuxt/<randomID>`.

If `buildDir` is set in `nuxt.config`, the value will be used instead of random one.

Build directory can be also set in `config` options:

```js
setupTest({
  config: {
    buildDir: 'nuxt-build',
  }
})
```

##### randomPort

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

#### server

Whether to launch a server to respond to requests in the test suite.

* Type: `boolean`
* Default: `false`

#### build

Whether to run a separate build step.

* Type: `boolean`
* Default: `false` (`true` if `browser` or `server` is enabled)
  
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
  