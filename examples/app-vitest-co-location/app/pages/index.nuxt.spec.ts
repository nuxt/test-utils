import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { TestCollectScans } from '~~/modules/collect-scans.ts'

import Page from './index.vue'

it('should mount page', async () => {
  const wrapper = await mountSuspended(Page)
  const title = wrapper.find('h1')
  expect(title.text()).toContain('Index Page')

  const appConfig = wrapper.find('#app-config')
  expect(appConfig.text()).toContain('foo: bar')
})

it('should ignore plugins and middlewares', async () => {
  const wrapper = await mountSuspended(Page)
  const scans: TestCollectScans = JSON.parse(wrapper.find('#scans').text())

  expect(scans.plugins).toContain('app/plugins/message.ts')
  expect(scans.plugins).not.toContain('app/plugins/message.nuxt.test.ts')

  expect(scans.middlewares).toContain('app/middleware/logger.global.ts')
  expect(scans.middlewares).not.toContain('app/middleware/logger.global.nuxt.spec.ts')
})
