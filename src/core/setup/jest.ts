import type { TestHooks } from '../types'

export default async function setupJest(hooks: TestHooks) {
  const { jest, test, beforeEach, afterAll, afterEach } = await import('@jest/globals')

  hooks.ctx.mockFn = jest.fn as (...args: unknown[]) => unknown

  test('setup', hooks.beforeAll, hooks.ctx.options.setupTimeout)
  beforeEach(hooks.beforeEach)
  afterEach(hooks.afterEach)
  afterAll(hooks.afterAll, hooks.ctx.options.teardownTimeout)
}
