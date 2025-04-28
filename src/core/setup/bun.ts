import type { TestHooks } from '../types'

export default async function setupBun(hooks: TestHooks) {
  // @ts-expect-error we do not want bun types present in global context
  const bunTest = await import('bun:test')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks.ctx.mockFn = bunTest.mock as any

  bunTest.beforeAll(hooks.beforeAll)
  bunTest.beforeEach(hooks.beforeEach)
  bunTest.afterEach(hooks.afterEach)
  bunTest.afterAll(hooks.afterAll)
}
