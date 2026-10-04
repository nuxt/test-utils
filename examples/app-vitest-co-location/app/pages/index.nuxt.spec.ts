import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import Page from './index.vue'

it('should mount', async () => {
  const wrapper = await mountSuspended(Page)
  expect(wrapper.text()).toContain('Index Page')
  expect(wrapper.text()).toContain('foo: bar')
})
