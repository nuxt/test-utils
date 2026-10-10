import { it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'

import Page from '../index.vue'

mockNuxtImport(useAppConfig, vi.fn)

it('should mount', async () => {
  const wrapper = await mountSuspended(Page)
  expect(wrapper.text()).toContain('Index Page')
})
