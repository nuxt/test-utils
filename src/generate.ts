import { getContext } from './context'
import { loadNuxtPackage } from './nuxt'

export async function generate () {
  const ctx = getContext()
  const { Builder, Generator } = await loadNuxtPackage()

  const builder = new Builder(ctx.nuxt)
  const generator = new Generator(ctx.nuxt, builder)

  await generator.generate(ctx.generateOptions)
}
