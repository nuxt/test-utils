---
title: Assertion
description: How to expect test results
position: 4
version: 1
category: API Reference
categoryPosition: 2
---

When you write tests for a Nuxt module, you normally expect the module to be installed with certain conditions. Below are some wrapper methods for easy validating module's testing result.

## Methods

### `expectModuleToBeCalledWith(method, ...args)`

* `method`
  * Type: `String`
  * `required`
  * Available values are `addPlugin`, `addLayout`, `addErrorLayout`, `addServerMiddleware` and `requireModule`
* `args`
  * `optional`
  * Additional parameters that is expected to be passed to the tested `method`

Expect a specific method to be triggered while installing a module.

```js
test('should inject plugin', () => {
  expectModuleToBeCalledWith('addPlugin', {
    src: expect.stringContaining('templates/plugin.js'),
    fileName: 'myPlugin.js',
    options: getNuxt().options.myModule
  })
})
```

### `expectModuleNotToBeCalledWith(method, ...args)`

* `method`
  * Type: `String`
  * `required`
  * Available values are `addPlugin`, `addLayout`, `addErrorLayout`, `addServerMiddleware` and `requireModule`
* `args`
  * `optional`
  * Additional parameters that is expected to be passed to the tested `method`

Expect a specific method to **not** be triggered while installing a module.

```js
test('should inject plugin', () => {
  expectModuleNotToBeCalledWith('addLayout')
})
```
