import { getContext } from './context'
import { loadNuxtPackage } from './nuxt'
import { build } from './build'

export async function generate () {
  const ctx = getContext()
  const { Generator } = await loadNuxtPackage()

  if (!ctx.builder) {
    await build()
  }

  const generator = new Generator(ctx.nuxt, ctx.builder)

  await generator.generate({ build: false })
}
