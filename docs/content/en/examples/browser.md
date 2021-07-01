---
title: Browser testing
description: ''
position: 22
category: Examples
categoryPosition: 3
---

```js
import { setupTest, createPage } from '@nuxt/test-utils'

describe('browser', () => {
  setupTest({
    browser: true
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const body = await page.innerHTML('body')
    expect(body).toContain('Works!')
  })
})
```
