# @nuxt/test-utils

> **Warning**
> This repository is only for the Nuxt 2 version of `@nuxt/test-utils`. For Nuxt 3, see [this repository](https://github.com/nuxt/nuxt/tree/main/packages/test-utils) and [these docs](https://nuxt.com/docs/getting-started/testing#testing).

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Checks][checks-src]][checks-href]
[![Codecov][codecov-src]][codecov-href]

> Test utilities for [Nuxt 2](https://nuxtjs.org)

- [✨ **Release Notes**](./CHANGELOG.md)
- [📖 **Nuxt 2 documentation**](https://test-utils.nuxtjs.org)

## Features

- Easy to setup tests
- Test in browser
- Extend Jest matchers
- Written in TypeScript

📖 [Read more](https://test-utils.nuxtjs.org)

## Usage

1. Add `@nuxt/test-utils` devDependency to your project

```bash
yarn add --dev @nuxt/test-utils # or npm install --save-dev @nuxt/test-utils
```

2. Add `@nuxt/test-utils` to the `preset` section of `jest.config.js`

```js
module.exports = {
  preset: '@nuxt/test-utils'
}
```

[📖 **Read more about setup and configuration**](https://test-utils.nuxtjs.org/api-reference/setup)

## Development

1. Clone this repository
2. Install dependencies using `yarn install`

## 📑 License

[MIT License](./LICENSE)

Copyright (c) Nuxt.js Team

<!-- Badges -->
[npm-version-src]: https://flat.badgen.net/npm/v/@nuxt/test-utils/0.x
[npm-version-href]: https://npmjs.com/package/@nuxt/test-utils
[npm-downloads-src]: https://flat.badgen.net/npm/dm/@nuxt/test-utils
[npm-downloads-href]: https://npmjs.com/package/@nuxt/test-utils
[checks-src]: https://flat.badgen.net/github/checks/nuxt/test-utils/main
[checks-href]: https://github.com/nuxt/test-utils/actions
[codecov-src]: https://flat.badgen.net/codecov/c/github/nuxt/test-utils
[codecov-href]: https://codecov.io/gh/nuxt/test-utils
