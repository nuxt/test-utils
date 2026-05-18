import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import Badge from '@nuxt/ui/components/Badge.vue'
import Breadcrumb from '@nuxt/ui/components/Breadcrumb.vue'
import Header from '@nuxt/ui/components/Header.vue'

describe('components', () => {
  it('ui/Badge', async () => {
    const wrapper = await mountSuspended(Badge, {
      props: {
        label: 'Hello',
      },
    })
    expect(wrapper.text()).toBe('Hello')
  })

  it('ui/Header', async () => {
    const wrapper = await mountSuspended(Header, {
      props: {
        title: 'App',
        to: '/',
      },
    })
    expect(wrapper.text()).toBe('App')
    expect(wrapper.find('a')?.attributes('href')).toBe('/')
  })

  it('ui/Breadcrumb', async () => {
    const component = await mountSuspended(Breadcrumb, {
      props: {
        items: [
          {
            label: 'Home',
            to: '/',
          },
          {
            label: 'Help',
            to: '/help',
          },
        ],
      },
    })

    const links = component.findAll('a')
    expect(links).toHaveLength(2)

    expect(links[0]?.text()).toBe('Home')
    expect(links[0]?.attributes('href')).toBe('/')

    expect(links[1]?.text()).toBe('Help')
    expect(links[1]?.attributes('href')).toBe('/help')
  })
})
