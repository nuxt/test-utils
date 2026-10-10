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

  expect(scans).toEqual({
    pages: [
      'app/pages/about.vue',
      'app/pages/about/index.vue',
      'app/pages/index.vue',
    ],
    imports: [
      'app/composables/useMessage.ts',
    ],
    components: [
      'app/components/Message.vue',
    ],
    plugins: [
      'app/plugins/message.ts',
    ],
    middlewares: [
      'app/middleware/logger.global.ts',
    ],
    // empty because client environment
    serverHandlers: [],
  })
})
