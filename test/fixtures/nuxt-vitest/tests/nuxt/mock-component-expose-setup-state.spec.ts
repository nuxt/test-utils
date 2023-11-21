import { expect, it } from 'vitest'
import { mountSuspended } from 'vitest-environment-nuxt/utils'
import MockComponent from './mocks/MockComponent.vue'

it('should expose setup state', async () => {
  const component = await mountSuspended(MockComponent)
  expect(component.setupState.counter.value).toBe(1)
  expect(component.setupState.doubled.value).toBe(2)
})
