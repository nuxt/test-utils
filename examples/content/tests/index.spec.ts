import { describe, expect, it } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

import App from '~/app.vue'

// Example usage: queryCollection(pages).path('/').first()
mockNuxtImport('queryCollection', () => (_id: string) => ({
  path: (_path: string) => ({
    first: () => ({
      title: 'My page',
    }),
  }),
}))

describe('test utils', () => {
  it('can mount components within nuxt suspense', async () => {
    const component = await mountSuspended(App)
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>Index page</div>
      <div>title: My page</div>"
    `)
  })
})
