import { describe, expect, it } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime-utils'

import App from '~/app.vue'

// Example usage: queryContent('/').limit(1).find()
mockNuxtImport('queryContent', () => (_id: string) => ({
  limit: (_limit: number) => ({
    find: () => [{
      title: 'My page'
    }]
  })
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
