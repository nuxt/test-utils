const { Builder, Generator } = require('./nuxt')
const init = require('./init')

module.exports = async (config, options = {}) => {
  const nuxt = await init(config)

  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)
  await generator.generate(options)

  return {
    nuxt,
    builder,
    generator
  }
}
