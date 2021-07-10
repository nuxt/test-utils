import { getContext } from './context'
import { loadNuxtPackage } from './nuxt'

export async function generate () {
  const { nuxt } = getContext()
  const { Builder, Generator } = await loadNuxtPackage()

  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)

  await generator.generate()
}
