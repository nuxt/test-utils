import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import Badge from '@nuxt/ui/components/Badge.vue'

describe('components', () => {
  it('ui/Badge', async () => {
    const wrapper = await mountSuspended(Badge, {
      props: {
        label: 'Hello',
      },
    })
    expect(wrapper.text()).toBe('Hello')
  })
})
