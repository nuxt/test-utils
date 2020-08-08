---
title: 'Usage'
position: 3
category: 'Getting started'
---

You can test the settings by following the example below:

## Test module

```js
import { setupTest } from '@nuxtjs/module-test-utils'

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
    expect(ctx).toHaveCalledNuxtAddPlugin({
      src: expect.stringContaining('templates/plugin.js'),
      fileName: 'myPlugin.js',
      options: ctx.config.myModule
    })
  })
})
```

## Test in browser

```js
import { setupTest, createPage } from '@nuxtjs/module-test-utils'

describe('browser', () => {
  const ctx = setupTest({
    __dirname,
    fixture: 'example',
    browser: true
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const html = await page.getHtml()
    expect(html).toContain('Works!')
  })
})
```
