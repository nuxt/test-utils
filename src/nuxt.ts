import { resolve } from 'path'
import defu from 'defu'
import { getContext } from './context'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.config || {})
}

export async function loadFixture () {
  const ctx = getContext()

  ctx.rootDir = resolve(ctx.__dirname, ctx.fixture)

  const configPath = resolve(ctx.rootDir, ctx.configFile)
  const loadedConfig = await import(configPath).then(m => m.default || m)

  ctx.config = defu(ctx.config, loadedConfig)

  if (!ctx.config.rootDir) {
    ctx.config.rootDir = ctx.rootDir
  }
}

export async function loadNuxtPackage (name: string = 'nuxt') {
  return await import(name + '-edge')
    .catch(() => import(name))
}
