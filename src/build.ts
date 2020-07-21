import { getContext } from './context'
import { loadNuxtPackage } from './nuxt'

export async function build () {
  const ctx = getContext()
  const { Builder } = await loadNuxtPackage()

  ctx.builder = new Builder(ctx.nuxt)

  await ctx.builder.build()
}
