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

function dropTestFiles<T>(items: T[], toPath: (item: T) => string | undefined) {
  const filtered = items.filter((item) => {
    const path = toPath(item)
    return !path || !isTestFile(path)
  })
  if (filtered.length !== items.length) {
    items.splice(0, items.length, ...filtered)
  }
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

  // But do not register test files into the Nuxt app
  nuxt.addHooks({
    'app:resolve'(app) {
      dropTestFiles(app.plugins, v => v.src)
      dropTestFiles(app.middleware, v => v.path)
    },
    'components:extend'(components) {
      dropTestFiles(components, v => v.filePath)
    },
    'imports:extend'(imports) {
      dropTestFiles(imports, v => v.from)
    },
    'pages:extend'(_pages) {
      const dropTestPages = (pages: typeof _pages) => {
        dropTestFiles(pages, p => p.file)
        pages.forEach(p => dropTestPages(p.children ?? []))
      }
      dropTestPages(_pages)
    },
  })
}
