import { resolve } from 'path'
import defu from 'defu'
import { getContext } from './context'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.options.config)
}

export async function loadFixture () {
  const { options } = getContext()

  options.rootDir = resolve(options.testDir, options.fixture)

  const loadedConfig = await import(resolve(options.rootDir, options.configFile))
    .then(m => /* istanbul ignore next */ m.default || m)

  options.config = defu(options.config, loadedConfig)

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
