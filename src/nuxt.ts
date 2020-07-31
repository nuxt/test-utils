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

  ctx.rootDir = resolve(ctx.__dirname, ctx.fixture)

  const loadedConfig = await import(resolve(ctx.rootDir, ctx.configFile))
    .then(m => /* istanbul ignore next */ m.default || m)

  ctx.config = defu(ctx.config, loadedConfig)

  if (!ctx.config.rootDir) {
    ctx.config.rootDir = ctx.rootDir
  }
}

export async function loadNuxtPackage (name: string = 'nuxt') {
  return await import(name + '-edge')
    .catch(/* istanbul ignore next */ () => import(name))
}
