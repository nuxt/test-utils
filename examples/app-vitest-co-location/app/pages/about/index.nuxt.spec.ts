import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { NuxtPage } from '#components'

it('should mount child page', async () => {
  const wrapper = await mountSuspended(NuxtPage, {
    route: '/about',
  })
  expect(wrapper.text()).toContain('About Page')
  expect(wrapper.text()).toContain('About Index')
})
