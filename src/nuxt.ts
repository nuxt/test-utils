import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { getContext } from './context'
import { randomId } from './utils'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.options.config)
}

const isNuxtApp = (dir: string) => {
  return existsSync(resolve(dir, 'pages')) ||
    existsSync(resolve(dir, 'nuxt.config.js')) ||
    existsSync(resolve(dir, 'nuxt.config.ts'))
}

export async function loadFixture () {
  const { options } = getContext()

  if (!isNuxtApp(options.rootDir)) {
    throw new Error('Invalid nuxt app. (Please explicitly set `options.rootDir` pointing to a valid nuxt app)')
  }

  const { loadNuxtConfig } = await loadNuxtPackage()
  options.config = await loadNuxtConfig({
    rootDir: options.rootDir,
    configFile: options.configFile,
    configOverrides: options.config
  })

  if (!options.config.rootDir) {
    options.config.rootDir = options.rootDir
  }

  if (options.randomBuildDir && options.build) {
    options.config.buildDir = join(options.config.buildDir || '.nuxt', randomId())
  }

  if (options.randomPort && options.server) {
    options.config.server = {
      ...options.config.server,
      port: 0
    }
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
