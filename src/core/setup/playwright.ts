import type { TestHooks } from '../types'

const stubs: Array<keyof NodeJS.Process['stdout']> = ['clearLine', 'cursorTo']

export default async function setupPlaywright (hooks: TestHooks) {
  const { test } = await import('@playwright/test')
  for (const stub of stubs) {
    try {
      // TODO: investigate why this is required
      // @ts-expect-error assigning to read-only property
      process.stdout[stub] ||= () => {}
    } catch {
      // noop
    }
  }
  test.beforeAll(hooks.setup)
  test.beforeEach(hooks.beforeEach)

  test.afterEach(hooks.afterEach)
  test.afterAll(hooks.afterAll)
}

