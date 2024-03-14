import { test as base } from '@playwright/test'
import type { TestHooks, setup } from './e2e'
import { createTest, url } from './e2e'

export type ConfigOptions = {
  nuxt: Parameters<typeof setup>[0] | undefined
}

type WorkerOptions = {
  _nuxtHooks: TestHooks
}

export const test = base.extend<{}, WorkerOptions & ConfigOptions>({
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
  }
})

export { expect } from '@playwright/test'
