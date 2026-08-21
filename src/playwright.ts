import defu from 'defu'
import { test as base } from '@playwright/test'
import type { Page, Response } from 'playwright-core'
import type { GotoOptions, TestOptions as SetupOptions, TestHooks } from './e2e.ts'
import { createTest, url, waitForHydration } from './e2e.ts'

// Playwright fixture options must be static, so they cannot read the resolved
// `setupTimeout`. This is only a backstop: the fixture below races its own
// `setupTimeout` deadline, which is what consumers actually configure. It has to
// stay above any plausible `setupTimeout` so Playwright never aborts us first,
// because Playwright skips fixture teardown when a fixture times out (which would
// orphan the dev server).
const FIXTURE_TIMEOUT_BACKSTOP = 30 * 60_000

// How long to wait for an abandoned `beforeAll` to settle before giving up on
// cleaning up whatever it spawned.
const ABANDONED_SETUP_GRACE = 30_000

export type ConfigOptions = {
  nuxt: Partial<SetupOptions> | undefined
  defaults: {
    nuxt: Partial<SetupOptions> | undefined
  }
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
 *
 * In `playwright.config.ts` you can pass `defaults: { nuxt: {} }` object for merging with test.use nuxt options
 */
export const test = base.extend<TestOptions, WorkerOptions & ConfigOptions>({
  nuxt: [undefined, { option: true, scope: 'worker' }],
  defaults: [{ nuxt: undefined }, { option: true, scope: 'worker' }],
  _nuxtHooks: [
    async ({ nuxt, defaults }, use) => {
      const hooks = createTest(defu(nuxt || {}, defaults.nuxt || {}))
      const { setupTimeout } = hooks.ctx.options

      const setup = hooks.beforeAll()
      let timer: ReturnType<typeof setTimeout> | undefined
      const timedOut = await Promise.race([
        setup.then(() => false),
        new Promise<true>((resolve) => {
          timer = setTimeout(() => resolve(true), setupTimeout)
        }),
      ]).finally(() => clearTimeout(timer))

      if (timedOut) {
        // The abandoned setup may still spawn a server after this teardown, so
        // wait for it to settle and tear down once more.
        await hooks.afterAll()
        await Promise.race([
          setup.catch(() => {}),
          new Promise(resolve => setTimeout(resolve, ABANDONED_SETUP_GRACE)),
        ])
        await hooks.afterAll()
        const logs = hooks.ctx.serverLogs.slice(-50).join('\n')
        throw new Error(`Nuxt test setup timed out after ${setupTimeout}ms. Increase \`setupTimeout\` in your \`nuxt\` fixture options if this is expected.${logs ? `\n\nServer output:\n${logs}` : ''}`)
      }

      await use(hooks)
      await hooks.afterAll()
    }, { scope: 'worker', timeout: FIXTURE_TIMEOUT_BACKSTOP },
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
