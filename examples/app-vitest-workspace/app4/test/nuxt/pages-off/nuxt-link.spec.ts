import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import { NuxtLink } from '#components'

type DefaultSlotProp = { isActive: boolean, isExactActive: boolean }

describe('NuxtLink without pages', () => {
  enableAutoUnmount(afterEach)

  it('should mount', async () => {
    const wrapper = await mountSuspended(NuxtLink, {
      props: {
        to: '/',
      },
      slots: {
        default: () => 'Home',
      },
    })

    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toBe('/')
    expect(a.text()).toBe('Home')
  })

  it('should mount custom', async () => {
    const wrapper = await mountSuspended(NuxtLink, {
      props: {
        to: '/',
        custom: true,
      },
      slots: {
        default: ({ isActive, isExactActive }: DefaultSlotProp) =>
          `Home:${isActive}:${isExactActive}`,
      },
    })

    expect(wrapper.text()).toBe('Home:undefined:undefined')
  })
})
