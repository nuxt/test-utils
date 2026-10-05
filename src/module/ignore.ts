import type { Nuxt } from '@nuxt/schema'

const TEST_FILE_PATTERN = {
  modifiers: ['test', 'test-d', 'spec', 'spec-d'],
  extensions: [
    'ts', 'cts', 'mts', 'tsx', 'ctsx', 'mtsx',
    'js', 'cjs', 'mjs', 'jsx', 'cjsx', 'mjsx',
  ],
} as const

const IS_TEST_FILE_RE = /\.(?:test|spec)(?:-d)?\.[cm]?[tj]sx?$/

function isTestFile(src: string) {
  return IS_TEST_FILE_RE.test(src)
}

export async function setupNuxtIgnore(nuxt: Nuxt) {
  // We want to run Nuxt plugins on test files
  // so remove Nuxt's default ignore pattern
  nuxt.options.ignore = nuxt.options.ignore.filter(i => i !== '**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}')
  nuxt.hook('modules:done', () => {
    if (!nuxt._ignore) return
    // And add negated common test file patterns to `nuxt._ignore`
    // so that custom ignore patterns are covered
    for (const modifier of TEST_FILE_PATTERN.modifiers) {
      for (const extension of TEST_FILE_PATTERN.extensions) {
        nuxt._ignore.add(`!**/*.${modifier}.${extension}`)
      }
    }
  })

  nuxt.hook('app:resolve', (app) => {
    // But do not register test files inside plugins/ and middleware/ as real Nuxt plugins or middleware
    app.plugins = app.plugins.filter(plugin => !isTestFile(plugin.src))
    app.middleware = app.middleware.filter(middleware => !isTestFile(middleware.path))
  })
}
