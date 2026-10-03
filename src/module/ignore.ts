import type { Nuxt } from '@nuxt/schema'

const testIgnorePatterns = [
  /\/__tests__\//,
  /\.\{(spec|test)(-d)?(,(spec|test)(-d)?)*\}\.\{([cm]?[tj]sx?)(,([cm]?[tj]sx?))*\}$/,
  /\.\{(spec|test)(-d)?(,(spec|test)(-d)?)*\}\.([cm]?[tj]sx?)$/,
  /\.(spec|test)(-d)?\.\{([cm]?[tj]sx?)(,([cm]?[tj]sx?))*\}$/,
  /\.(spec|test)(-d)?\.([cm]?[tj]sx?)$/,
] as const

export async function setupNuxtIgnore(nuxt: Nuxt) {
  // We want to run Nuxt plugins on test files
  const testIgnores = new Set(nuxt.options.ignore.filter(i => !i.startsWith('!') && testIgnorePatterns.some(p => p.test(i))))
  if (testIgnores.size) {
    nuxt.options.ignore = nuxt.options.ignore.filter(i => !testIgnores.has(i))
  }
}
