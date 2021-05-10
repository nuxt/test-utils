---
title: Testing on the Server
description: Set up server-side testing for a Nuxt application
position: 11
version: 1
category: Writing tests
---

Nuxt test utils exposes a number of useful methods you can use when testing a Nuxt application.

These helper methods require that you pass `{ server: true }` as an option to `setupTest` ([more info](/api-reference/setup#features-to-enable)).

## get

You can get a response to a server-rendered page with `get`.

### Example

```js
import { get, setupTest } from '@nuxt/test-utils'

describe('ssr', () => {
  setupTest({ server: true })

  it('renders the index page', async () => {
    const { body } = await get('/')

    expect(body).toContain('<a>A Link</a>')
  })
})
```

## url

This helper simply returns the full URL for a given page (including the port the test server is running on.)

### Example

```js
import { url, setupTest } from '@nuxt/test-utils'

describe('ssr', () => {
  setupTest({ server: true })

  it('renders the index page', async () => {
    const thePage = url('/page')
    // is something like 'http://localhost:6840/page'
  })
})
```
