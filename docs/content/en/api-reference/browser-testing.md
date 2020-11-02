---
title: Testing in a browser
description: Set up testing for browser
position: 12
version: 1
category: Writing tests
---

Under the hood, Nuxt test utils uses [`playwright`](https://playwright.dev/) to carry out browser testing.

These helper methods require that you pass `{ browser: true }` as an option to `setupTest` ([more info](/api-reference/setup#features-to-enable)).

## createPage

You can initiate a browser session for a given page with `createPage`.

You can find out more about the properties and methods on the page object [in the playwright documentation](https://playwright.dev/#version=master&path=docs%2Fpom.md&q=).

### Example

```js
import { createPage, setupTest } from '@nuxt/test-utils'

describe('browser', () => {
  setupTest({ browser: true })

  it('renders the index page', async () => {
    const page = await createPage('/')
    const html = await page.innerHTML('body')

    expect(html).toContain('Something')
  })
})
```

