import type { TestHooks } from '../types'

export default async function setupVitest(hooks: TestHooks) {
  const vitest = await import('vitest')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks.ctx.mockFn = vitest.vi.fn as any

  vitest.beforeAll(hooks.setup, hooks.ctx.options.setupTimeout)
  vitest.beforeEach(hooks.beforeEach)
  vitest.afterEach(hooks.afterEach)
  vitest.afterAll(hooks.afterAll)
}
