import type { Nuxt, NuxtConfig } from '@nuxt/schema'
import type { Browser, LaunchOptions } from 'playwright-core'
import type { exec } from 'tinyexec'
import type { StartServerOptions } from './server'

export type TestRunner = 'vitest' | 'jest' | 'cucumber'

export interface TestOptions {
  testDir: string
  fixture: string
  /**
   * Name of the configuration file.
   * @default `'nuxt.config`
   */
  configFile: string
  /**
   * Path to a directory with a Nuxt app to be put under test.
   * @default `'.'`
   */
  rootDir: string
  buildDir: string
  nuxtConfig: NuxtConfig
  /**
   * Whether to run a separate build step.
   * @default `true` (`false` if `browser` or `server` is disabled, or if a `host` is provided)
   */
  build: boolean
  dev: boolean
  /**
   * The amount of time (in milliseconds) to allow for `setupTest` to complete its work (which could include building or generating files for a Nuxt application, depending on the options that are passed).
   * @default `60000`
   */
  setupTimeout: number
  waitFor: number
  /**
   * Under the hood, Nuxt test utils uses [`playwright`](https://playwright.dev) to carry out browser testing. If this option is set, a browser will be launched and can be controlled in the subsequent test suite.
   * @default `false`
   */
  browser: boolean
  /**
   * Specify the runner for the test suite. One of `'vitest' | 'jest' | 'cucumber'`.
   * @default `vitest`
   */
  runner: TestRunner
  logLevel: number
  browserOptions: {
    /** The type of browser to launch - either `chromium`, `firefox` or `webkit` */
    type: 'chromium' | 'firefox' | 'webkit'
    /** `object` of options that will be passed to playwright when launching the browser. See [full API reference](https://playwright.dev/docs/api/class-browsertype#browser-type-launch). */
    launch?: LaunchOptions
  }
  /**
   * Whether to launch a server to respond to requests in the test suite.
   * @default `true` (`false` if a `host` is provided)
   */
  server: boolean
  /**
   * If provided, a URL to use as the test target instead of building and running a new server. Useful for running "real" end-to-end tests against a deployed version of your application, or against an already running local server.
   * @default `undefined`
   */
  host?: string
  /**
   * If provided, set the launched test server port to the value.
   * @default `undefined`
   */
  port?: number
  env?: StartServerOptions['env']
}

export interface TestContext {
  options: TestOptions
  nuxt?: Nuxt
  browser?: Browser
  url?: string
  serverProcess?: ReturnType<typeof exec>
  mockFn?: (...args: unknown[]) => unknown
  /**
   * Functions to run on the vitest `afterAll` hook.
   * Useful for removing anything created during the test.
   */
  teardown?: (() => void)[]
}

export interface TestHooks {
  beforeEach: () => void
  afterEach: () => void
  afterAll: () => Promise<void>
  setup: () => Promise<void>
  ctx: TestContext
}
