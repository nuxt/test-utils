# @nuxtjs/module-test-utils

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Circle CI][circle-ci-src]][circle-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> Test utilities for modules Nuxt.js

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

Add `@nuxtjs/module-test-utils` dependency to your project

```bash
yarn add --dev @nuxtjs/module-test-utils # or npm install --save-dev @nuxtjs/module-test-utils
```

## Usage

You can test the settings by following the example below:

```js
const { setupTest } = require('@nuxtjs/module-test-utils')

describe('module', () => {
  const ctx = setupTest({
    __dirname,
    fixture: 'example',
    config: {
      myModule: {
        test: 123
      }
    }
  })

  test('should inject plugin', () => {
    expect(ctx).toNuxtPluginAdded({
      src: expect.stringContaining('templates/plugin.js'),
      fileName: 'myPlugin.js',
      options: ctx.config.myModule
    })
  })
})
```

### Test in browser

```js
import { setupTest, createPage } from '@nuxtjs/module-test-utils'

describe('browser', () => {
  const ctx = setupTest({
    __dirname,
    browser: true,
    fixture: 'example'
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const html = await page.getHtml()
    expect(html).toContain('Works!')
  })
})
```

## License

[MIT License](./LICENSE)

Copyright (c) - Nuxt Community

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/module-test-utils/latest.svg?style=flat-square
[npm-version-href]: https://npmjs.com/package/@nuxtjs/module-test-utils

[npm-downloads-src]: https://img.shields.io/npm/dt/@nuxtjs/module-test-utils.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/module-test-utils

[circle-ci-src]: https://img.shields.io/circleci/project/github/nuxt-community/module-test-utils.svg?style=flat-square
[circle-ci-href]: https://circleci.com/gh/nuxt-community/module-test-utils

[codecov-src]: https://img.shields.io/codecov/c/github/nuxt-community/module-test-utils.svg?style=flat-square
[codecov-href]: https://codecov.io/gh/nuxt-community/module-test-utils

[license-src]: https://img.shields.io/npm/l/@nuxtjs/module-test-utils.svg?style=flat-square
[license-href]: https://npmjs.com/package/@nuxtjs/module-test-utils
