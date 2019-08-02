const { Nuxt, Builder, Generator } = require('./nuxt')

module.exports = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()

  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)
  await generator.generate()

  return {
    nuxt,
    builder,
    generator
  }
}
