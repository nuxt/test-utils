import { resolve } from 'path'
import defu from 'defu'
import { spyOnClass } from './jest'
import { getContext } from './context'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.config || {})

  const { moduleContainer } = ctx.nuxt
  spyOnClass(moduleContainer)

  await ctx.nuxt.ready()
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

export async function loadNuxtPackage () {
  const name = 'nuxt'

  return await import(name + '-edge')
    .catch(() => import(name))
}
