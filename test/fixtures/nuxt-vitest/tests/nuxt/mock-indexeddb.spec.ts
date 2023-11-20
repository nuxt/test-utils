import { expect, it } from 'vitest'
import { mountSuspended } from 'vitest-environment-nuxt/utils'
import IndexedDbComponent from '~/components/IndexedDbComponent.vue'

// Mocking of indexedDB can be enabled in vite.config.ts

it('should mock indexeddb', async () => {
  const component = await mountSuspended(IndexedDbComponent, {
    props: {
      title: 'Hello world',
    },
  })
  expect(component.html()).toMatchInlineSnapshot(`
    "<div>
      <h1>IndexedDbComponent</h1><pre>Hello world</pre>
    </div>"
  `)
})
