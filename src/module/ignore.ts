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
  const testIgnores = new Set(nuxt.options.ignore.filter(isTestFileIgnorePattern))
  if (testIgnores.size) {
    nuxt.options.ignore = nuxt.options.ignore.filter(i => !testIgnores.has(i))
  }

  // But do not register test files inside plugins/ as real Nuxt plugins
  nuxt.hook('app:resolve', (app) => {
    app.plugins = app.plugins.filter(plugin => !isTestPluginFile(plugin.src))
  })
}
