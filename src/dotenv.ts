import process from 'node:process'
import { readFile, stat } from 'node:fs/promises'
import { parseEnv } from 'node:util'
import { resolve } from 'pathe'

export interface DotenvOptions {
  /** Directory to resolve `fileName` against. */
  cwd?: string
  /**
   * File or files to load; later files take priority.
   * @default '.env'
   */
  fileName?: string | string[]
  /** @default true */
  interpolate?: boolean
  /** @default process.env */
  env?: NodeJS.ProcessEnv
}

const dotenvKeys = new WeakMap<object, Set<string>>()

export async function setupDotenv(options: DotenvOptions = {}): Promise<Record<string, string | undefined>> {
  const target = options.env ?? process.env
  const cwd = resolve(options.cwd || '.')
  const fileNames = typeof options.fileName === 'string' ? [options.fileName] : options.fileName ?? ['.env']

  const environment: Record<string, string | undefined> = Object.assign(Object.create(null), target)
  const loaded = new Set<string>()
  const owned = dotenvKeys.get(target) ?? new Set<string>()
  dotenvKeys.set(target, owned)

  for (const fileName of fileNames) {
    const path = resolve(cwd, fileName)
    if (!(await stat(path).catch(() => undefined))?.isFile()) {
      continue
    }
    const parsed = parseEnv(await readFile(path, 'utf8'))
    for (const key in parsed) {
      if (key in environment && !owned.has(key) && !loaded.has(key)) {
        continue
      }
      environment[key] = parsed[key]
      loaded.add(key)
    }
  }

  if (options.interpolate ?? true) {
    interpolate(environment)
  }

  for (const key of loaded) {
    owned.add(key)
    if (!key.startsWith('_')) {
      target[key] = environment[key]
    }
  }

  return environment
}

const REFERENCE_RE = /(\\)?\$(?:\{([\w:]+)\}|([\w:]+))/g

function interpolate(env: Record<string, string | undefined>) {
  const resolveValue = (value: string | undefined, parents: string[]): string | undefined => {
    if (typeof value !== 'string') {
      return value
    }
    return value.replace(REFERENCE_RE, (match, escaped: string | undefined, braced: string | undefined, bare: string | undefined) => {
      if (escaped) {
        return match.slice(1)
      }
      const key = (braced ?? bare)!
      if (parents.includes(key)) {
        console.warn(`Please avoid recursive environment variables ( loop: ${parents.join(' > ')} > ${key} )`)
        return ''
      }
      return resolveValue(env[key], [...parents, key]) ?? match
    })
  }
  for (const key in env) {
    env[key] = resolveValue(env[key], [key])
  }
}
