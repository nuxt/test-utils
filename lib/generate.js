const { Builder, Generator } = require('./nuxt')
const init = require('./init')

module.exports = async (config, options = {}, { beforeNuxtReady = null } = {}) => {
  const nuxt = await init(config, { beforeNuxtReady })

  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)
  await generator.generate(options)

  return {
    nuxt,
    builder,
    generator
  }
}
