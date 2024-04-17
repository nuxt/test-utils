// TODO: export these
// https://github.com/unjs/nitro/tree/main/src/runtime/utils.env.ts

// TODO: improve types upstream
/* eslint-disable @typescript-eslint/no-explicit-any */

import destr from 'destr'
import { snakeCase } from 'scule'

export type EnvOptions = {
  env?: Record<string, any>
  prefix?: string
  altPrefix?: string
}

export function getEnv(key: string, opts: EnvOptions) {
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
