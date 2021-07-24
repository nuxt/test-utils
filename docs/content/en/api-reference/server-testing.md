---
title: Testing on the server
description: Set up server-side testing for a Nuxt application
position: 11
version: 1
category: Writing tests
---

Nuxt test utils exposes a number of useful methods you can use when testing a Nuxt application.

## get

You can get a response to a server-rendered page with `get`.

### Example

```js
import { get, setupTest } from '@nuxt/test-utils'

describe('ssr', () => {
  setupTest()

  test('renders the index page', async () => {
    const html = await get('/')
    
    expect(html).toContain('<a>A Link</a>')
  })
})
```

## url

This helper simply returns the full URL for a given page (including the port the test server is running on.)

### Example

```js
import { url, setupTest } from '@nuxt/test-utils'

describe('ssr', () => {
  setupTest()

  test('renders the index page', async () => {
    console.log(await url('/page'))
    // will print something like 'http://localhost:68420/page'
  })
})
```
