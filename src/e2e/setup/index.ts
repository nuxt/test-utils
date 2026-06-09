import { createTestContext, setTestContext } from '../context.ts'
import { buildFixture, loadFixture } from '../nuxt.ts'
import { startServer, stopServer } from '../server.ts'
import { createBrowser } from '../browser.ts'
import type { TestHooks, TestOptions } from '../types.ts'
import setupBun from './bun.ts'
import setupCucumber from './cucumber.ts'
import setupJest from './jest.ts'
import setupVitest from './vitest.ts'

export const setupMaps = {
  bun: setupBun,
  cucumber: setupCucumber,
  jest: setupJest,
  vitest: setupVitest,
}

export function createTest(options: Partial<TestOptions>): TestHooks {
  const ctx = createTestContext(options)

  const beforeEach = () => {
    setTestContext(ctx)
  }

  const afterEach = () => {
    setTestContext(undefined)
  }

  const afterAll = async () => {
    if (ctx.serverProcess) {
      setTestContext(ctx)
      await stopServer()
      setTestContext(undefined)
    }
    if (ctx.nuxt && ctx.nuxt.options.dev) {
      await ctx.nuxt.close()
    }
    if (ctx.browser) {
      await ctx.browser.close()
    }
    // clear side effects
    await Promise.all(!ctx.teardown ? [] : ctx.teardown.map(fn => fn()))
  }

  const beforeAll = async () => {
    if (ctx.options.fixture) {
      await loadFixture()
    }

    if (ctx.options.build) {
      await buildFixture()
    }

    if (ctx.options.server) {
      await startServer(ctx.options.env)
    }

    if (ctx.options.waitFor) {
      await (new Promise(resolve => setTimeout(resolve, ctx.options.waitFor)))
    }

    if (ctx.options.browser) {
      await createBrowser()
    }
  }

  return {
    beforeEach,
    afterEach,
    afterAll,
    beforeAll,
    setup: beforeAll,
    ctx,
  }
}

export async function setup(options: Partial<TestOptions> = {}) {
  if (typeof __NUXT_VITEST_RESOLVED__ === 'boolean' && __NUXT_VITEST_RESOLVED__) {
    console.warn(
      'Do not use defineVitestConfig or defineVitestProject for end-to-end tests, as they only work with nuxt client-environment tests.\n'
      + 'Please refer to the setup section: https://nuxt.com/docs/4.x/getting-started/testing#setup')
  }

  const hooks = createTest(options)

  const setupFn = setupMaps[hooks.ctx.options.runner]

  await setupFn(hooks)
}

declare const __NUXT_VITEST_RESOLVED__: boolean | undefined
