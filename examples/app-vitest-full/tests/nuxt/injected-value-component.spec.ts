import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import { VUE_INJECTED_VALUE } from '~/plugins/inject-value'
import InjectedValueComponent from '~/components/InjectedValueComponent.vue'

describe('InjectedValueComponent', () => {
  it('can use injected values from a plugin', async () => {
    const component = await mountSuspended(InjectedValueComponent)
    expect(component.text()).toContain(VUE_INJECTED_VALUE)
  })
})
