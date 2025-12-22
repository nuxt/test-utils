// @vitest-environment-options { "startOn": "beforeAll" }
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockComponent, mockNuxtImport, mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'

import { VUE_INJECTED_VALUE2 } from '~/plugins/inject-value'
import InjectedValueComponent from '~/components/InjectedValueComponent2.vue'

const {
  isPositive,
} = vi.hoisted(() => ({
  isPositive: vi.fn(() => false),
}))

mockNuxtImport(useCounter, () => () => ({
  count: ref(100),
  isPositive,
}))

mockComponent('TestButton', {
  template: '<span>MockTestButton</span>',
})

describe('plugins', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('can access injections', () => {
    const app = useNuxtApp()
    expect(app.$auth.didInject).toMatchInlineSnapshot('true')
    expect(app.$router).toBeDefined()
  })

  it('can mock composable', () => {
    const app = useNuxtApp()
    expect(app.$counter.count.value).toBe(100)
    expect(app.$counter.isPositive()).toBe(false)
    expect(isPositive).toHaveBeenCalledOnce()
  })

  it('can use composable inside component', async () => {
    const wrapper = await mountSuspended(defineComponent({
      template: '<span>{{ $counter.count }}:{{ $counter.isPositive() }}</span>',
    }))
    expect(wrapper.html()).toBe('<span>100:false</span>')
    expect(isPositive).toHaveBeenCalledOnce()
  })

  it('can mock component on mountSuspended', async () => {
    const wrapper = await mountSuspended(defineComponent({
      template: '<custom-test-button />',
    }))
    expect(wrapper.html()).toBe('<span>MockTestButton</span>')
  })

  it('can mock component on renderSuspended', async () => {
    const wrapper = await renderSuspended(defineComponent({
      template: '<custom-test-button />',
    }))
    expect(wrapper.html()).toContain('<span>MockTestButton</span>')
  })

  it('export `Symbol()` without global registry does match', async () => {
    const component = await mountSuspended(InjectedValueComponent)
    expect(component.text()).toContain(VUE_INJECTED_VALUE2)
  })
})
