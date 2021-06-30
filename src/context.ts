import type { RequestListener } from 'http'
import { join } from 'path'
import defu from 'defu'
import { NuxtConfig, NuxtOptions } from '@nuxt/types'
import type { Browser, LaunchOptions } from 'playwright'

export interface NuxtTestOptions {
  testDir: string
  fixture: string
  configFile: string
  rootDir: string
  config: NuxtConfig

  build: boolean

  generate: boolean
  generateOptions: {
    build: boolean
    init: boolean
  }

  setupTimeout: number
  waitFor: number

  browser: boolean
  browserOptions: {
    type: 'chromium' | 'firefox' | 'webkit'
    launch?: LaunchOptions
  }

  server: boolean
}

export interface NuxtTestContext {
  options: NuxtTestOptions

  nuxt?: {
    server: {
      app: RequestListener,
    },
    options: NuxtOptions
    ready: () => any
    close: (callback?: Function) => any
    resolver: any
    moduleContainer: any
    resolveAlias(path: string): string
    resolvePath(path: string, opts?: any): string
    renderRoute(...args: any[]): any
    renderAndGetWindow(url: string, opts?: any, config?: any): any
  }

  browser?: Browser

  url?: string

  builder?: {
    build: () => any
  }
}

let currentContext: NuxtTestContext

export function createContext (options: Partial<NuxtTestOptions>): NuxtTestContext {
  const _options: Partial<NuxtTestOptions> = defu(options, {
    testDir: join(process.cwd(), 'test'),
    fixture: 'fixture',
    configFile: 'nuxt.config',
    setupTimeout: 60000,
    server: options.browser,
    build: options.browser || options.server,
    config: {},
    browserOptions: {
      type: 'chromium'
    }
  })

  return setContext({ options: _options as NuxtTestOptions })
}

export function getContext (): NuxtTestContext {
  if (global.$nuxtTestContext) {
    return global.$nuxtTestContext
  }

  if (currentContext) {
    return currentContext
  }

  throw new Error('No context is available. (Forgot calling setup or createContext?)')
}

export function setContext (context: NuxtTestContext): NuxtTestContext {
  if (global) {
    global.$nuxtTestContext = context
  }

  currentContext = context

  return currentContext
}
