# @nuxt/test-utils

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Checks][checks-src]][checks-href]
[![Codecov][codecov-src]][codecov-href]

> Test utilities for [Nuxt.js](https://nuxtjs.org)

- [✨ **Release Notes**](./CHANGELOG.md)
- [📖 **Documentation**](https://test-utils.nuxtjs.org)

## Features

- Easy to setup tests
- Test in brownser
- Extend jest matchers
- Written in TypeScript

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

[📖 **Read more**](https://test-utils.nuxtjs.org)

## Development

1. Clone this repository
2. Install dependencies using `yarn install`

## 📑 License

[MIT License](./LICENSE)

Copyright (c) Nuxt.js Team

<!-- Badges -->
[npm-version-src]: https://flat.badgen.net/npm/v/@nuxt/image
[npm-version-href]: https://npmjs.com/package/@nuxt/image
[npm-downloads-src]: https://flat.badgen.net/npm/dm/@nuxt/image
[npm-downloads-href]: https://npmjs.com/package/@nuxt/image
[checks-src]: https://flat.badgen.net/github/checks/nuxt/image/master
[checks-href]: https://github.com/nuxt/image/actions
[codecov-src]: https://flat.badgen.net/codecov/c/github/nuxt/image
[codecov-href]: https://codecov.io/gh/nuxt/image
