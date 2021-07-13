import defu from 'defu'
import { NuxtTestContext, NuxtTestOptions } from './types'

let currentContext: NuxtTestContext

export function createContext (options: Partial<NuxtTestOptions> = {}): NuxtTestContext {
  const _options: Partial<NuxtTestOptions> = defu(options, {
    rootDir: '.',
    configFile: 'nuxt.config',
    randomBuildDir: true,
    randomPort: true,
    setupTimeout: 60000,
    server: options.browser,
    build: options.browser || options.server,
    browserOptions: {
      type: 'chromium'
    }
  })

  return setContext({ options: _options as NuxtTestOptions })
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
