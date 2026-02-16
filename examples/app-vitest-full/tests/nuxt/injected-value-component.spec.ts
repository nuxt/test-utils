import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import {
  CUSTOM_VUE_PLUGIN_SYMBOL,
  CUSTOM_VUE_PLUGIN_SYMBOL2,
  VUE_INJECTED_VALUE,
  VUE_INJECTED_VALUE2,
} from '~/plugins/inject-value'

import InjectedValueComponent from '~/components/InjectedValueComponent.vue'

describe('InjectedValueComponent', () => {
  it('can use injected values from a plugin', async () => {
    const component = await mountSuspended(InjectedValueComponent)
    expect(component.html()).toContain(`<span>${VUE_INJECTED_VALUE}</span>`)
    expect(component.html()).toContain(`<span>${VUE_INJECTED_VALUE2}</span>`)
  })

  it('can inject `Symbol.for()`', () => {
    useNuxtApp().runWithContext(() => {
      expect(inject(CUSTOM_VUE_PLUGIN_SYMBOL)).toBe(VUE_INJECTED_VALUE)
    })
  })

  it('can inject `Symbol()`', () => {
    useNuxtApp().runWithContext(() => {
      expect(inject(CUSTOM_VUE_PLUGIN_SYMBOL2)).toBe(VUE_INJECTED_VALUE2)
    })
  })
  it('can stub injected values', async () => {
    const component = await mountSuspended(InjectedValueComponent, {
      global: {
        provide: {
          [VUE_INJECTED_VALUE]: 'stubbed value',
        },
      },
    })
    expect(component.text()).toContain('stubbed value')
  })
})
