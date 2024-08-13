import { resolve } from 'node:path'
import { defu } from 'defu'
import { withTrailingSlash } from 'ufo'
import type { DateString } from 'compatx'
import type { TestContext, TestOptions } from './types'

let currentContext: TestContext | undefined

export function createTestContext(options: Partial<TestOptions>): TestContext {
  const _options: Partial<TestOptions> = defu(options, {
    testDir: resolve(process.cwd(), 'test'),
    fixture: 'fixture',
    configFile: 'nuxt.config',
    setupTimeout: 120 * 1000,
    dev: !!JSON.parse(process.env.NUXT_TEST_DEV || 'false'),
    logLevel: 1,
    server: true,
    build: (options.browser !== false) || (options.server !== false),
    nuxtConfig: {
      // suppress compatibility date warning for runtime environment tests
      compatibilityDate: '2024-04-03' as DateString,
    },
    browserOptions: {
      type: 'chromium' as const,
    },
  } satisfies Partial<TestOptions>)

  // Disable build and server if endpoint is provided
  if (_options.host) {
    _options.build = false
    _options.server = false
  }

  if (process.env.VITEST === 'true') {
    _options.runner ||= 'vitest'
  }
  else if (process.env.JEST_WORKER_ID) {
    _options.runner ||= 'jest'
  }

  return setTestContext({
    options: _options as TestOptions,
    url: withTrailingSlash(_options.host),
  })
}

export function useTestContext(): TestContext {
  recoverContextFromEnv()
  if (!currentContext) {
    throw new Error('No context is available. (Forgot calling setup or createContext?)')
  }
  return currentContext
}

export function setTestContext(context: TestContext): TestContext
export function setTestContext(context?: TestContext): TestContext | undefined
export function setTestContext(context?: TestContext): TestContext | undefined {
  currentContext = context
  return currentContext
}

export function isDev() {
  const ctx = useTestContext()
  return ctx.options.dev
}

export function recoverContextFromEnv() {
  if (!currentContext && process.env.NUXT_TEST_CONTEXT) {
    setTestContext(JSON.parse(process.env.NUXT_TEST_CONTEXT || '{}'))
  }
}

export function exposeContextToEnv() {
  const { options, browser, url } = currentContext!
  process.env.NUXT_TEST_CONTEXT = JSON.stringify({ options, browser, url })
}
