import { test as base } from '@playwright/test'
import type { Page, Response } from 'playwright-core'
import type { GotoOptions, TestHooks, setup } from './e2e'
import { createTest, url, waitForHydration } from './e2e'

export type ConfigOptions = {
  nuxt: Parameters<typeof setup>[0] | undefined
}

type WorkerOptions = {
  _nuxtHooks: TestHooks
}

type TestOptions = {
  goto: (url: string, options?: GotoOptions) => Promise<Response | null>
}

export const test = base.extend<TestOptions, WorkerOptions & ConfigOptions>({
  nuxt: [undefined, { option: true, scope: 'worker' }],
  _nuxtHooks: [
    async ({ nuxt }, use) => {
      const hooks = createTest(nuxt || {})
      await hooks.setup()
      await use(hooks)
      await hooks.afterAll()
    }, { scope: 'worker' }
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
      await waitForHydration(page, url, waitUntil);
      return response;
    });
  },
})

export { expect } from '@playwright/test'
