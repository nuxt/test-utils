import defu from 'defu'
import { resolve } from 'path'
import { spyOnClass } from './jest'
import { getContext } from './context'

export async function loadNuxt() {
  const ctx = getContext()

  const { Nuxt } = await loadNuxtPackage('nuxt')

  ctx.nuxt = new Nuxt(ctx.config || {})

  const { moduleContainer } = ctx.nuxt
  spyOnClass(moduleContainer)

  await ctx.nuxt.ready()
}

export async function loadFixture() {
  const ctx = getContext()

  ctx.rootDir = resolve(ctx.__dirname, ctx.fixture)

  const loadedConfig = await import(resolve(ctx.rootDir, 'nuxt.config.js'))
    .then(m => m.default || m)

  ctx.config = defu(ctx.config, loadedConfig)

  if (!ctx.config.rootDir) {
    ctx.config.rootDir = ctx.rootDir
  }
}

export async function loadNuxtPackage(name: 'nuxt') {
  return await import(name + '-edge')
    .catch(() => import(name))

}
