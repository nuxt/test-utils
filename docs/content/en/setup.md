---
title: Installation
description: 'How to install the Nuxt test utilities'
position: 2
category: Guide
categoryPosition: 2
---

## Installation

Add `@nuxt/test-utils` to your project (as a development dependency):

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add --dev jest @nuxt/test-utils
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install --save-dev jest @nuxt/test-utils
  ```

  </code-block>
</code-group>

<alert type="info">

`@nuxt/test-utils` depends on [Jest](https://jestjs.io/docs/en/getting-started).

</alert>

## Configure Jest

Add `@nuxt/test-utils` to the `preset` section of `jest.config.js`

```js{}[jest.config.js]
module.exports = {
  preset: '@nuxt/test-utils'
}
```
