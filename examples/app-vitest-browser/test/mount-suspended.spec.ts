import { describe, it, expect } from 'vitest'

import { mountSuspended } from '@nuxt/test-utils/runtime'

import { MyCounter } from '#components'

describe('Component (MyCounter)', () => {
  it('renders', async () => {
    const component = await mountSuspended(MyCounter)
    expect(component.text()).toContain('Count: 0')
  })

  it('can be interacted with (increment)', async () => {
    const component = await mountSuspended(MyCounter)
    const incrementButton = component.findAll('button').filter(btn => btn.text().includes('Increment'))[0]
    incrementButton.element.click()
    await nextTick()
    expect(component.text()).toContain('Count: 1')
  })

  it('can be interacted with (decrement)', async () => {
    const component = await mountSuspended(MyCounter)
    const decrementButton = component.findAll('button').filter(btn => btn.text().includes('Decrement'))[0]
    decrementButton.element.click()
    await nextTick()
    expect(component.text()).toContain('Count: -1')
  })

  it('can use Nuxt-specific composables', async () => {
    const component = await mountSuspended(MyCounter)
    expect(component.text()).toContain('"buildAssetsDir": "/_nuxt/"')
  })
})
