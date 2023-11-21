import { expect, it } from 'vitest'
import { mockComponent, mountSuspended } from 'vitest-environment-nuxt/utils'
import App from '~/app.vue'

mockComponent('SomeComponent', () => import('./mocks/MockComponent.vue'))

it('should mock', async () => {
  const component = await mountSuspended(App)
  expect(component.html()).toMatchInlineSnapshot(`
    "<div> Mocked 1 * 2 = 2</div>
    <div> I am a global component </div>
    <div>Index page</div>
    <a href=\\"/test\\"> Test link </a>"
  `)
})
