import { resolve } from 'path'
import defu from 'defu'
import { NuxtConfig, NuxtOptions } from '@nuxt/types'

let currentContext: NuxtTestContext

export function createContext (options: Partial<NuxtTestContext>): NuxtTestContext {
  return setContext(defu(options, {
    testDir: resolve(process.cwd(), 'test'),
    fixture: 'fixture',
    configFile: 'nuxt.config.js',
    browserString: 'puppeteer',
    buildTimeout: 60000,
    server: options.browser,
    build: options.browser || options.server,
    config: {}
  }))
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

export interface NuxtTestContext {
  testDir: string
  fixture: string
  configFile: string

  rootDir: string
  config: NuxtConfig
  nuxt: {
    options: NuxtOptions
    listen: (port?: number) => any
    ready: () => any
    close: () => any
    moduleContainer: any
  }

  browser: any // TIB
  browserString: string
  browserOptions: any

  build: boolean
  builder: {
    build: () => any
  }
  buildTimeout: number

  generate: boolean
  generateOptions: {
    build: boolean
    init: boolean
  }

  waitFor: number

  server: boolean
  url: string
}
