import type { TestHooks } from '../types'

export default async function setupCucumber (hooks: TestHooks) {
  const { After, AfterAll, Before, BeforeAll } = await import('@cucumber/cucumber')

  BeforeAll({ timeout: hooks.ctx.options.setupTimeout }, async () => {
    try {
      console.log({ timeout: hooks.ctx.options.setupTimeout })
      await hooks.setup()
    } catch (error) {
      console.error(error)
    }
  })
  Before({}, hooks.beforeEach)

  After(hooks.afterEach)
  AfterAll(hooks.afterAll)
}

