import type { TestHooks } from '../types.ts'

export default async function setupVitest(hooks: TestHooks) {
  const vitest = await import('vitest')

  hooks.ctx.mockFn = vitest.vi.fn

  vitest.beforeAll(hooks.beforeAll, hooks.ctx.options.setupTimeout)
  vitest.beforeEach(hooks.beforeEach)
  vitest.afterEach(hooks.afterEach)
  vitest.afterAll(hooks.afterAll, hooks.ctx.options.teardownTimeout)
}
