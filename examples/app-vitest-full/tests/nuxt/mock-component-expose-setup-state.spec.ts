import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MockComponent from './mocks/MockComponent.vue'

it('should expose setup state', async () => {
  const component = await mountSuspended(MockComponent)
  expect(component.setupState.counter.value).toBe(1)
  expect(component.setupState.doubled.value).toBe(2)
})

it('should modify expose setup state', async () => {
  const component = await mountSuspended(MockComponent)
  expect(component.text()).toBe('Mocked 1 * 2 = 2')
  component.setupState.counter.value = 10
  await nextTick()
  expect(component.text()).toBe('Mocked 10 * 2 = 20')
})
