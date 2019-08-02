const { Nuxt, Builder } = require('./nuxt')

module.exports = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()

  const builder = new Builder(nuxt)
  await builder.build()

  return {
    nuxt,
    builder
  }
}
