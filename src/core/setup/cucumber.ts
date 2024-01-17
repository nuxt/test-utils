import type { TestHooks } from '../types'

export default async function setupJest (hooks: TestHooks) {
  const { After, AfterAll, Before, BeforeAll } = await import('@cucumber/cucumber')

  BeforeAll({ timeout: hooks.ctx.options.setupTimeout }, hooks.setup)
  Before({}, hooks.beforeEach)

  After(hooks.afterEach)
  AfterAll(hooks.afterAll)
}

