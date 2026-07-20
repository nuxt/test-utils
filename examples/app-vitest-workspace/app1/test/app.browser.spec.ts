import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import { NuxtLink } from '#components'

describe('app', () => {
  it('useAppConfig', () => {
    expect(Object.keys(useAppConfig())).toEqual(['nuxt'])
  })

  it('mountSuspended', async () => {
    const wrapper = await mountSuspended(NuxtLink, {
      slots: {
        default: () => 'Hello',
      },
    })

    expect(wrapper.text()).toBe('Hello')
  })
})
