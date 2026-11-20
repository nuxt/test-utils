import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import App from '~/app.vue'
import { Counter } from '#components'

describe('mount', () => {
  enableAutoUnmount(afterEach)

  it('should mount page', async () => {
    const wrapper = await mountSuspended(App, {
      route: '/',
    })

    const title = wrapper.find('h1')
    expect(title.text()).toBe('Index')

    const link = wrapper.find('a[href="/counter"]')
    expect(link.exists()).toBe(true)
  })

  it('should mount component', async () => {
    const wrapper = await mountSuspended(Counter)

    const title = wrapper.find('h2')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Counter Component')

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('0')
  })
})
