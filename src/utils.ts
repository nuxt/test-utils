// TODO: export these
// https://github.com/unjs/nitro/tree/main/src/runtime/utils.env.ts

// TODO: improve types upstream
/* eslint-disable @typescript-eslint/no-explicit-any */

import destr from 'destr'
import { snakeCase } from 'scule'
import { pathToFileURL } from 'node:url'
import { resolveModulePath } from 'exsolve'

type EnvOptions = {
  env?: Record<string, any>
  prefix?: string
  altPrefix?: string
}

function getEnv(key: string, opts: EnvOptions) {
  const env = opts.env ?? process.env
  const envKey = snakeCase(key).toUpperCase()
  return destr(
    env[opts.prefix + envKey] ?? env[opts.altPrefix + envKey],
  )
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
        'nuxi requires `@nuxt/kit` to be installed in your project. Try installing `nuxt` v3+ or `@nuxt/bridge` first.',
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
