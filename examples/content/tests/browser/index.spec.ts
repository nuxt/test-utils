import { describe, expect, it } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { render } from 'vitest-browser-vue'
import App from '~/app.vue'

// Example usage: queryCollection(pages).path('/').first()
mockNuxtImport('queryCollection', () => (_id: string) => ({
  path: (_path: string) => ({
    first: () => ({
      title: 'My page',
    }),
  }),
}))

describe('App', () => {
  it('works with mountSuspended', async () => {
    const component = await mountSuspended(App)
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>Index page</div>
      <div>title: My page</div>"
    `)
  })

  // TODO: render does not currently support <Suspense>
  it.skip('works with vitest-browser-vue', () => {
    const { getByText } = render(App)
    expect(getByText('Index page')).toBeInTheDocument()
    expect(getByText('title: My page')).toBeInTheDocument()
  })
})
