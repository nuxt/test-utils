import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import type { Nuxt, NuxtConfig } from '@nuxt/schema'
import { resolveAlias } from '@nuxt/kit'
import { resolveModulePath } from 'exsolve'
import { isAbsolute, join, resolve } from 'pathe'
import type { Plugin } from 'vite'

const PLUGIN_NAME = 'nuxt:test-utils:cache-key'

export function NuxtVitestCacheKeyPlugin(nuxt: Nuxt, overrides: Partial<NuxtConfig>): Plugin {
  const key = getNuxtConfigHash(nuxt, overrides)
  return {
    name: PLUGIN_NAME,
    configureVitest(context) {
      if (context.defineCacheKeyGenerator) {
        context.defineCacheKeyGenerator(() => key)
      }
      else {
        context.experimental_defineCacheKeyGenerator?.(() => key)
      }
    },
  }
}

function getNuxtConfigHash(nuxt: Nuxt, overrides: Partial<NuxtConfig>) {
  const layers = nuxt.options._layers.filter(layer => !layer.cwd.includes('node_modules'))

  const files = new Set<string>()
  for (const file of [...nuxt.options._nuxtConfigFiles || [], ...layers.map(layer => layer.configFile)]) {
    if (file && isAbsolute(file)) {
      collectFiles(file, files)
    }
  }
  for (const layer of layers) {
    const dirs = layer.config.rootDir === nuxt.options.rootDir ? nuxt.options.dir : layer.config.dir
    collectFiles(resolve(layer.config.srcDir || layer.cwd, dirs?.modules || 'modules'), files)
  }
  for (const entry of [...layers.flatMap(layer => layer.config.modules || []), ...overrides.modules || []]) {
    const path = resolveLocalModule(nuxt, Array.isArray(entry) ? entry[0] : entry)
    if (path) {
      collectFiles(path, files)
    }
  }

  const rcFile = join(nuxt.options.rootDir, '.nuxtrc')
  const hash = createHash('sha256').update(serialize({
    overrides: withoutRuntimeValues(overrides),
    layers: layers.map(layer => withoutRuntimeValues(layer.config)),
    rc: existsSync(rcFile) ? readFileSync(rcFile, 'utf8') : undefined,
  }))
  for (const file of [...files].sort()) {
    hash.update(`\0${file}\0`).update(readFileSync(file))
  }
  return hash.digest('hex')
}

function withoutRuntimeValues(config: NuxtConfig) {
  return { ...config, runtimeConfig: undefined, appConfig: undefined }
}

function resolveLocalModule(nuxt: Nuxt, name: unknown) {
  if (typeof name !== 'string') {
    return
  }
  let path = resolveAlias(name, nuxt.options.alias)
  if (path.startsWith('./') || path.startsWith('../')) {
    path = resolve(nuxt.options.rootDir, path)
  }
  if (!isAbsolute(path) || path.includes('node_modules')) {
    return
  }
  return existsSync(path) ? path : resolveModulePath(path, { try: true, extensions: ['.ts', '.mts', '.js', '.mjs', '.cts', '.cjs'] })
}

function collectFiles(path: string, files: Set<string>) {
  const stat = statSync(path, { throwIfNoEntry: false })
  if (stat?.isFile()) {
    files.add(path)
  }
  else if (stat?.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (entry !== 'node_modules') {
        collectFiles(join(path, entry), files)
      }
    }
  }
}

function serialize(value: unknown) {
  const seen = new WeakSet<object>()
  return JSON.stringify(value, (_key, value: unknown) => {
    if (typeof value === 'function' || value instanceof RegExp) {
      return value.toString()
    }
    if (typeof value === 'bigint') {
      return `${value}n`
    }
    if (value && typeof value === 'object') {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)
      if (value instanceof Map || value instanceof Set) {
        return [...value]
      }
      if (!Array.isArray(value)) {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, (value as Record<string, unknown>)[key]]))
      }
    }
    return value
  })
}
