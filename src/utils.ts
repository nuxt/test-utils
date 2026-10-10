// TODO: export these
// https://github.com/unjs/nitro/tree/main/src/runtime/utils.env.ts

// TODO: improve types upstream
/* eslint-disable @typescript-eslint/no-explicit-any */

import process from 'node:process'
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { dirname, join } from 'pathe'
import { resolveModulePath } from 'exsolve'

type EnvOptions = {
  env?: Record<string, any>
  prefix?: string
  altPrefix?: string
}

function getEnv(key: string, opts: EnvOptions) {
  const env = opts.env ?? process.env
  const envKey = toEnvKey(key)
  return parseEnvValue(
    env[opts.prefix + envKey] ?? env[opts.altPrefix + envKey],
  )
}

function toEnvKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[-./\s]+/g, '_')
    .toUpperCase()
}

const JSON_SIGNATURE_RE = /^\s*["[{]|^\s*-?\d{1,16}(?:\.\d{1,17})?(?:e[+-]?\d+)?\s*$/i

function parseEnvValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }
  if (value[0] === '"' && value.at(-1) === '"' && !value.includes('\\')) {
    return value.slice(1, -1)
  }
  switch (value.trim().toLowerCase()) {
    case 'true': return true
    case 'false': return false
    case 'undefined': return undefined
    case 'null': return null
    case 'nan': return Number.NaN
    case 'infinity': return Number.POSITIVE_INFINITY
    case '-infinity': return Number.NEGATIVE_INFINITY
  }
  if (!JSON_SIGNATURE_RE.test(value)) {
    return value
  }
  try {
    return JSON.parse(value, (key, val) => key === '__proto__' || (key === 'constructor' && val && typeof val === 'object' && 'prototype' in val) ? undefined : val)
  }
  catch {
    return value
  }
}

function _isObject(input: unknown) {
  return typeof input === 'object' && !Array.isArray(input)
}

export function applyEnv(obj: Record<string, any>, opts: EnvOptions, parentKey = '') {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key
    const envValue = getEnv(subKey, opts)
    if (_isObject(obj[key])) {
      // Same as before
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...(envValue as object) }
        applyEnv(obj[key], opts, subKey)
      }
      // If envValue is undefined
      // Then proceed to nested properties
      else if (envValue === undefined) {
        applyEnv(obj[key], opts, subKey)
      }
      // If envValue is a primitive other than undefined
      // Then set objValue and ignore the nested properties
      else {
        obj[key] = envValue ?? obj[key]
      }
    }
    else {
      obj[key] = envValue ?? obj[key]
    }
  }
  return obj
}

/**
 * Deep-copy plain objects and arrays, passing anything else through by reference.
 *
 * `structuredClone` throws `DataCloneError` on proxies and functions, both of which turn up in
 * `nuxt.options` (module mutation tracking wraps options in proxies) and in user-provided config
 * overrides. Only plain containers need copying here; the clone exists to avoid mutating the
 * caller's objects.
 */
export function deepCopy<T>(input: T, seen = new WeakMap<object, any>()): T {
  if (typeof input !== 'object' || input === null) {
    return input
  }

  const proto = Object.getPrototypeOf(input)
  if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) {
    return input
  }

  const existing = seen.get(input)
  if (existing) {
    return existing
  }

  if (Array.isArray(input)) {
    const copy: any[] = []
    seen.set(input, copy)
    for (const item of input) {
      copy.push(deepCopy(item, seen))
    }
    return copy as T
  }

  const copy: Record<string, any> = {}
  seen.set(input, copy)
  for (const key in input) {
    copy[key] = deepCopy((input as Record<string, any>)[key], seen)
  }
  return copy as T
}

export async function loadKit(rootDir: string): Promise<typeof import('@nuxt/kit')> {
  try {
    const kitPath = resolveModulePath('@nuxt/kit', { from: tryResolveNuxt(rootDir) || rootDir })

    let kit: typeof import('@nuxt/kit') = await import(pathToFileURL(kitPath).href)
    if (!kit.writeTypes) {
      kit = {
        ...kit,
        writeTypes: () => {
          throw new Error('`writeTypes` is not available in this version of `@nuxt/kit`. Please upgrade to v3.7 or newer.')
        },
      }
    }
    return kit
  }
  catch (e: any) {
    if (e.toString().includes('Cannot find module \'@nuxt/kit\'')) {
      throw new Error(
        '`@nuxt/test-utils` requires `@nuxt/kit` to be installed in your project. Try installing `nuxt` v3+ or `@nuxt/bridge` first.',
        { cause: e },
      )
    }
    throw e
  }
}

function tryResolveNuxt(rootDir: string) {
  for (const pkg of ['nuxt-nightly', 'nuxt', 'nuxt3', 'nuxt-edge']) {
    const path = resolveModulePath(pkg, { from: rootDir, try: true })
    if (path) {
      return path
    }
  }
  return null
}

export function getPackageInfo(name: string, dirs: string | string[] = process.cwd()): { rootPath: string, version?: string, packageJson: Record<string, any> } | undefined {
  const bases = (Array.isArray(dirs) ? dirs : [dirs]).map(dir => dir.endsWith('/') ? dir : `${dir}/`)
  const entry = resolveModulePath(`${name}/package.json`, { from: bases, try: true })
    ?? resolveModulePath(name, { from: bases, try: true })
  if (!entry) {
    return
  }
  let dir = dirname(entry)
  while (true) {
    const packageJsonPath = join(dir, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      return { rootPath: dir, version: packageJson.version, packageJson }
    }
    const parent = dirname(dir)
    if (parent === dir) {
      return
    }
    dir = parent
  }
}

export function resolveH3Package(rootDir: string, appDir: string, modulesDir: string[]): { rootPath: string, version: 1 | 2, packageJson: Record<string, any> } | undefined {
  const nuxtServerIntegration = getPackageInfo('@nuxt/nitro-server', appDir)

  let nitroPath: string | undefined
  for (const nitroCandidate of [
    ...nuxtServerIntegration?.packageJson.dependencies?.nitro
      ? ['nitro', 'nitro-nightly']
      : ['nitropack', 'nitropack-nightly'],
  ]) {
    nitroPath = resolveModulePath(nitroCandidate, { from: nuxtServerIntegration?.rootPath || appDir, try: true })
    if (nitroPath) {
      break
    }
  }

  const h3Info = getPackageInfo('h3', rootDir)
    || getPackageInfo('h3', nitroPath ? dirname(nitroPath) : modulesDir)
  if (!h3Info) {
    return
  }
  return { ...h3Info, version: h3Info.version?.startsWith('2.') ? 2 : 1 }
}
