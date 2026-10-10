import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import type { TestCollectScans } from '~~/modules/collect-scans'

await setup({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
})

it('should keep ignore test files in runtime dirs', async () => {
  expect(await $fetch('/api/collect-scans')).toEqual({
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
    serverHandlers: [
      'server/api/collect-scans.ts',
      'server/api/hello.get.ts',
    ],
  } satisfies TestCollectScans)
})
