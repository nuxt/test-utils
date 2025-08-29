import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { render } from 'vitest-browser-vue'
import App from '~/app.vue'

describe('App', () => {
  it('works with mountSuspended', async () => {
    const component = await mountSuspended(App)
    // expect(component.html()).toMatchInlineSnapshot(`
    //   "<div>Index page</div>
    //   <div>title: My page</div>"
    // `)
  })

  it('works with vitest-browser-vue', () => {
    const { getByText } = render(App)
    // expect(getByText('Index page')).toBeInTheDocument()
    // expect(getByText('title: My page')).toBeInTheDocument()
  })
})
