import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SomeComponent from '~/components/SomeComponent.vue'

it('should render any component', async () => {
  const component = await mountSuspended(SomeComponent)
  expect(component.html()).toContain('This component has a dependency on Nuxt UI.')
})
