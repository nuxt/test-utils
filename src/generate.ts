import { getContext } from './context'
import { loadNuxtPackage, getNuxt } from './nuxt'

export async function generate () {
  const { options } = getContext()
  const nuxt = getNuxt()
  const { Builder, Generator } = await loadNuxtPackage()

  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)

  await nuxt.server.listen(0)
  await generator.generate(options.generate);
  await nuxt.close()
}
