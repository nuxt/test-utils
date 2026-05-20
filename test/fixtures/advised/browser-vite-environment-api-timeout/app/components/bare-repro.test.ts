import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import BareRepro from './BareRepro.vue'

describe('bare browser repro', () => {
  it('mounts the component', async () => {
    const component = await mountSuspended(BareRepro)

    expect(component.text()).toContain('bare browser repro')
  })
})
