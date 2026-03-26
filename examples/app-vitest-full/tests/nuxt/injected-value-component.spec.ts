import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import {
  CUSTOM_VUE_PLUGIN_SYMBOL,
  CUSTOM_VUE_PLUGIN_SYMBOL2,
  CUSTOM_VUE_PLUGIN_WITH_ARRAY_KEY,
  VUE_INJECTED_VALUE,
  VUE_INJECTED_VALUE2,
  VUE_INJECTED_ARRAY_VALUE,
} from '~/plugins/inject-value'

import InjectedValueComponent from '~/components/InjectedValueComponent.vue'

describe('InjectedValueComponent', () => {
  it('can use injected values from a plugin', async () => {
    const component = await mountSuspended(InjectedValueComponent)
    expect(component.html()).toContain(`<span>${VUE_INJECTED_VALUE}</span>`)
    expect(component.html()).toContain(`<span>${VUE_INJECTED_VALUE2}</span>`)
    expect(component.html()).toContain(`<span>${VUE_INJECTED_ARRAY_VALUE.join('|')}</span>`)
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
          [CUSTOM_VUE_PLUGIN_SYMBOL]: 'stubbed value',
        },
      },
    })
    expect(component.text()).toContain('stubbed value')
  })

  it('can stub injected values with array', async () => {
    const component = await mountSuspended(InjectedValueComponent, {
      global: {
        provide: {
          [CUSTOM_VUE_PLUGIN_WITH_ARRAY_KEY]: [11, 22, 33],
        },
      },
    })
    expect(component.text()).toContain('11|22|33')
  })
})
