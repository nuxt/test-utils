import { getContext } from './context'
import { loadNuxtPackage, getNuxt } from './nuxt'

export async function generate () {
  const { options } = getContext()
  const nuxt = getNuxt()
  const { Builder, Generator } = await loadNuxtPackage()

  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)

  await generator.generate(options.generate)
}
