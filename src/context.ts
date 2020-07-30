import defu from 'defu'
import { NuxtTestContext } from './types'

let currentContext: NuxtTestContext

export function createContext (options: Partial<NuxtTestContext>): NuxtTestContext {
  return setContext(defu(options, {
    __dirname,
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
