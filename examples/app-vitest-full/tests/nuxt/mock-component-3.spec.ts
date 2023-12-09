import { expect, it } from 'vitest'
import { mockComponent, mountSuspended } from '@nuxt/test-utils/runtime'
import { SomeComponent } from '#components'

mockComponent('SomeComponent', async () => {
  const { h } = await import('vue')
  return {
    setup() {
      return () => h('div', null, 'Mocked')
    },
  }
})

it('should mock', async () => {
  const component = await mountSuspended(SomeComponent)
  expect(component.html()).toMatchInlineSnapshot(`"<div>Mocked</div>"`)
})
