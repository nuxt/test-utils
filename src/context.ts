import { resolve } from 'path'
import defu from 'defu'
import { NuxtConfig, NuxtOptions } from '@nuxt/types'
import type { Browser, LaunchOptions } from 'playwright'

let currentContext: NuxtTestContext

export function createContext (options: Partial<NuxtTestOptions>): NuxtTestContext {
  const _options: NuxtTestOptions = defu(options, {
    testDir: resolve(process.cwd(), 'test'),
    fixture: 'fixture',
    configFile: 'nuxt.config.js',
    setupTimeout: 60000,
    server: options.browser,
    build: options.browser || options.server,
    config: {},
    browserOptions: {
      type: 'chromium'
    }
  })

  return setContext({ options: _options })
}

export function getContext (): NuxtTestContext {
  if (!currentContext) {
    throw new Error('No context is available. (Forgot calling setup or createContext?)')
  }

  return currentContext
}

export function setContext (context: NuxtTestContext): NuxtTestContext {
  currentContext = context

  return currentContext
}

export interface NuxtTestOptions {
  testDir: string
  fixture: string
  configFile: string
  rootDir: string
  buildDir: string
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
    launch: LaunchOptions
  }

  server: boolean
}

export interface NuxtTestContext {
  options: NuxtTestOptions

  nuxt?: {
    options: NuxtOptions
    listen: (port?: number) => any
    ready: () => any
    close: () => any
    moduleContainer: any
  }

  browser?: Browser

  url?: string

  builder?: {
    build: () => any
  }
}
