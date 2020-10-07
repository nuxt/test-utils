---
title: Test in browser
description: ''
position: 8
category: Examples
categoryPosition: 3
---

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
    const body = await page.innerHTML('body')
    expect(body).toContain('Works!')
  })
})
```
