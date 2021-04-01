import { existsSync } from 'fs'
import { resolve } from 'path'
import { getContext } from './context'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.options.config)
}

const resolveRootDir = () => {
  const { options } = getContext()
  const dirs = [options.rootDir, resolve(options.testDir, options.fixture), process.cwd()]

  const isNuxtApp = (dir: string) => {
    return existsSync(dir) && (
      existsSync(resolve(dir, 'pages')) ||
      existsSync(resolve(dir, 'nuxt.config.js')) ||
      existsSync(resolve(dir, 'nuxt.config.ts'))
    )
  }

  for (const dir in dirs) {
    if (dir && isNuxtApp(dir)) {
      return dir
    }
  }

  throw new Error('Invalid nuxt app. (Please explicitly set `options.rootDir` pointing to a valid nuxt app)')
}

export async function loadFixture () {
  const { options } = getContext()

  options.rootDir = resolveRootDir()

  const { loadNuxtConfig } = await loadNuxtPackage()
  options.config = await loadNuxtConfig({
    rootDir: options.rootDir,
    configFile: options.configFile,
    configOverrides: options.config
  })

  if (!options.config.rootDir) {
    options.config.rootDir = options.rootDir
  }

  if (!options.config.buildDir) {
    const randomId = Math.random().toString(36).substr(2, 8)
    options.config.buildDir = resolve(options.rootDir, '.nuxt', randomId)
  }
}

export async function loadNuxtPackage (name: string = 'nuxt') {
  return await import(name + '-edge')
    .catch(/* istanbul ignore next */ () => import(name))
}

export function getNuxt () {
  const ctx = getContext()
  return ctx.nuxt
}
