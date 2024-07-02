import { createTestContext, setTestContext } from '../context'
import { buildFixture, loadFixture } from '../nuxt'
import { reuseExistingServer, startServer, stopServer } from '../server'
import { createBrowser } from '../browser'
import type { TestHooks, TestOptions } from '../types'
import setupCucumber from './cucumber'
import setupJest from './jest'
import setupVitest from './vitest'

export const setupMaps = {
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

  const setup = async () => {
    if (ctx.options.reuseExistingServer) {
      await reuseExistingServer()
    }

    if (ctx.options.fixture) {
      await loadFixture()
    }

    if (ctx.options.build && !ctx.options.reuseExistingServer) {
      await buildFixture()
    }

    if (ctx.options.server && !ctx.options.reuseExistingServer) {
      await startServer()
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
    setup,
    ctx,
  }
}

export async function setup(options: Partial<TestOptions> = {}) {
  const hooks = createTest(options)

  const setupFn = setupMaps[hooks.ctx.options.runner]

  await setupFn(hooks)
}
