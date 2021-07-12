import { join } from 'path'
import { getContext } from './context'
import { ensureNuxtApp, randomId } from './utils'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.options.config)
}

export async function loadFixture () {
  const { options } = getContext()

  await ensureNuxtApp(options.rootDir)

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
