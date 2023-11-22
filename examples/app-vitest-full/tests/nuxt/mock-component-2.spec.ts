import { expect, it } from 'vitest'
import { mockComponent, mountSuspended } from '@nuxt/test-utils/runtime-utils'
import { SomeComponent } from '#components'

mockComponent('SomeComponent', () => import('./mocks/MockComponent.vue'))

it('should mock', async () => {
  const component = await mountSuspended(SomeComponent)
  expect(component.html()).toMatchInlineSnapshot('"<div> Mocked 1 * 2 = 2</div>"')
})
