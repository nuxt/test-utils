import type { TestHooks } from '../types.ts'

export default async function setupBun(hooks: TestHooks) {
  const bunTest = await import('bun:test')

  hooks.ctx.mockFn = bunTest.mock

  bunTest.beforeAll(hooks.beforeAll, hooks.ctx.options.setupTimeout)
  bunTest.beforeEach(hooks.beforeEach)
  bunTest.afterEach(hooks.afterEach)
  bunTest.afterAll(hooks.afterAll, hooks.ctx.options.teardownTimeout)
}
