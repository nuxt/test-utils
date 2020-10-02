---
title: Setup
description: 'How to install Test utilities for NuxtJS'
position: 2
category: Guide
categoryPosition: 2
---

<alert type="info">

Remember to have [Jest](https://jestjs.io/docs/en/getting-started) installed as a devDependency.

</alert>

## Installation

Add `@nuxt/module-utils` devDependency to your project:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add --dev @nuxt/test-utils
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install --save-dev @nuxt/test-utils
  ```

  </code-block>
</code-group>

## Configure

Add `@nuxtjs/module-test-utils` to the `preset` section of `jest.config.js`

```js
module.exports = {
  preset: '@nuxtjs/module-test-utils'
}
```
