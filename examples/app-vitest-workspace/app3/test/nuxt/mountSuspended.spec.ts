import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import App from '~~/app.vue'
import { Counter } from '#components'

describe('mountSuspended', () => {
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

  it('should handle event', async () => {
    const wrapper = await mountSuspended(Counter)
    const input = wrapper.find('input')

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    await button.trigger('click')
    expect(input.element.value).toBe('1')
  })

  it('should update props', async () => {
    const wrapper = await mountSuspended(Counter, {
      props: {
        title: 'Title',
      },
    })

    const title = wrapper.find('h2')
    expect(title.text()).toBe('Title')

    await wrapper.setProps({ title: 'Title(Updated)' })
    expect(title.text()).toBe('Title(Updated)')
  })
})
