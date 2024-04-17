import { test as base } from '@playwright/test'
import type { Page, Response } from 'playwright-core'
import type { GotoOptions, TestOptions as SetupOptions, TestHooks } from './e2e'
import { createTest, url, waitForHydration } from './e2e'

export type ConfigOptions = {
  nuxt: Partial<SetupOptions> | undefined
}

type WorkerOptions = {
  _nuxtHooks: TestHooks
}

type TestOptions = {
  goto: (url: string, options?: GotoOptions) => Promise<Response | null>
}

/**
 * Use a preconfigured Nuxt fixture.
 *
 * You can pass a `nuxt: {}` object in your device configuration, in the `use` key of your config file,
 * or use the following syntax within your test file to configure your Nuxt fixture:
 *
  ```ts
  test.use({
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    }
  })
  ```
 */
export const test = base.extend<TestOptions, WorkerOptions & ConfigOptions>({
  nuxt: [undefined, { option: true, scope: 'worker' }],
  _nuxtHooks: [
    async ({ nuxt }, use) => {
      const hooks = createTest(nuxt || {})
      await hooks.setup()
      await use(hooks)
      await hooks.afterAll()
    }, { scope: 'worker' },
  ],
  baseURL: async ({ _nuxtHooks }, use) => {
    _nuxtHooks.beforeEach()
    await use(url('/'))
    _nuxtHooks.afterEach()
  },
  goto: async ({ page }, use) => {
    await use(async (url, options) => {
      const waitUntil = options?.waitUntil
      if (waitUntil && ['hydration', 'route'].includes(waitUntil)) {
        delete options.waitUntil
      }
      const response = await page.goto(url, options as Parameters<Page['goto']>[1])
      await waitForHydration(page, url, waitUntil)
      return response
    })
  },
})

export { expect } from '@playwright/test'
