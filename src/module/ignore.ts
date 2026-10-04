import { resolveIgnorePatterns } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

const testIgnorePatterns = [
  /\/__tests__\//,
  /\.\{(?:spec|test)(?:-d)?(?:,(spec|test)(?:-d)?)*\}\.\{[cm]?[tj]sx?(?:,[cm]?[tj]sx?)*\}$/,
  /\.\{(?:spec|test)(?:-d)?(?:,(spec|test)(?:-d)?)*\}\.[cm]?[tj]sx?$/,
  /\.(?:spec|test)(?:-d)?\.\{[cm]?[tj]sx?(?:,[cm]?[tj]sx?)*\}$/,
  /\.(?:spec|test)(?:-d)?\.[cm]?[tj]sx?$/,
] as const

function isTestFileIgnorePattern(src: string) {
  return !src.startsWith('!') && testIgnorePatterns.some(p => p.test(src))
}

function isTestPluginFile(src: string) {
  return /\.(?:spec|test)(?:-d)?\.[cm]?[tj]sx?$/.test(src)
}

export async function setupNuxtIgnore(nuxt: Nuxt) {
  // We want to run Nuxt plugins on test files
  nuxt.options.ignore = nuxt.options.ignore.filter(i => !isTestFileIgnorePattern(i))
  nuxt.hook('modules:done', () => {
    if (!nuxt._ignore) return
    // And add negative patterns to nuxt._ignore for test files (e.g. from .nuxtignore)
    for (const pattern of resolveIgnorePatterns()) {
      if (isTestFileIgnorePattern(pattern)) {
        nuxt._ignore.add(`!${pattern}`)
      }
    }
  })

  nuxt.hook('app:resolve', (app) => {
    // But do not register test files inside plugins/ and middleware/ as real Nuxt plugins or middleware
    app.plugins = app.plugins.filter(plugin => !isTestPluginFile(plugin.src))
    app.middleware = app.middleware.filter(middleware => !isTestPluginFile(middleware.path))
  })
}
