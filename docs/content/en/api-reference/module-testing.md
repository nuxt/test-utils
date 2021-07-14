---
title: Testing modules
description: How to expect test results
position: 13
version: 1
category: Writing tests
categoryPosition: 2
---

When you write tests for a Nuxt module, you normally expect the module to be installed with certain conditions. Below are some wrapper methods for easily validating module's testing result.

## Methods

### `expectModuleToBeCalledWith(method, ...args)`

* `method`
  * Type: `String`
  * `required`
  * Available values are `addTemplate`, `extendBuild`, `extendRoutes`, `addModule`, `addPlugin`, `addLayout`, `addErrorLayout`, `addServerMiddleware` and `requireModule`
* `args`
  * `optional`
  * Additional parameters that are expected to be passed to the tested `method`

Expect a specific method to be triggered while installing a module.

```js
import { setupTest, expectModuleToBeCalledWith } from '@nuxt/test-utils'

describe('browser', () => {
  setupTest(
    rootDir: 'path/to/fixture',
    build: false
  )

  test('should inject plugin', () => {
    expectModuleToBeCalledWith('addPlugin', {
      src: expect.stringMatching(/templates[\\/]plugin.js/),
      fileName: 'myPlugin.js',
      options: getNuxt().options.myModule
    })
  })
})
```

### `expectModuleNotToBeCalledWith(method, ...args)`

* `method`
  * Type: `String`
  * `required`
  * Available values are `addTemplate`, `extendBuild`, `extendRoutes`, `addModule`, `addPlugin`, `addLayout`, `addErrorLayout`, `addServerMiddleware` and `requireModule`
* `args`
  * `optional`
  * Additional parameters that are expected to be passed to the tested `method`

Expect a specific method **not** to be triggered while installing a module.

```js
test('should inject plugin', () => {
  expectModuleNotToBeCalledWith('addLayout')
})
```

### `expectFileToBeGenerated(path)`

* `path`
  * Type: `String`
  * `required`

Expect a specific file be generated.

```js
test('should file generated', () => {
  expectFileToBeGenerated('index.html')
})
```

### `expectFileNotToBeGenerated(path)`

* `path`
  * Type: `String`
  * `required`

Expect a specific file **not** be generated.

```js
test('should file not generated', () => {
  expectFileNotToBeGenerated('foo.html')
})
```
