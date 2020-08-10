import { resolve } from 'path'
import defu from 'defu'
import { getContext } from './context'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.config)
}

export async function loadFixture () {
  const ctx = getContext()

  ctx.rootDir = resolve(ctx.testDir, ctx.fixture)

  const loadedConfig = await import(resolve(ctx.rootDir, ctx.configFile))
    .then(m => /* istanbul ignore next */ m.default || m)

  ctx.config = defu(ctx.config, loadedConfig)

  if (!ctx.config.rootDir) {
    ctx.config.rootDir = ctx.rootDir
  }

  if (!ctx.config.buildDir) {
    ctx.config.buildDir = resolve(ctx.rootDir, '.nuxt', ctx._id.toString())
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
