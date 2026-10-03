import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import Page from './team.vue'

it('mount team page', async () => {
  const wrapper = await mountSuspended(Page)
  expect(wrapper.text()).toContain('About team page')
})
