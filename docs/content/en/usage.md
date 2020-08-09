---
title: 'Usage'
position: 3
category: 'Getting started'
---

You can test the settings by following the example below:

## Test Module

```js
import { setupTest, getNuxt } from '@nuxtjs/module-test-utils'

describe('module', () => {
  setupTest({
    testDir: __dirname,
    fixture: 'example',
    config: {
      myModule: {
        test: 123
      }
    }
  })

  test('should inject plugin', () => {
    expectModuleToBeCalledWith('addPlugin', {
      src: expect.stringContaining('templates/plugin.js'),
      fileName: 'myPlugin.js',
      options: getNuxt().options.myModule
    })
  })
})
```

## Test in browser

```js
import { setupTest, createPage } from '@nuxtjs/module-test-utils'

describe('browser', () => {
  setupTest({
    testDir: __dirname,
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
