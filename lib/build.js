const { Nuxt, Builder } = require('./nuxt')

module.exports = async (config, waitFor = 0) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()

  const builder = new Builder(nuxt)
  await builder.build()

  await (new Promise(resolve => setTimeout(resolve, waitFor)))

  return {
    nuxt,
    builder
  }
}
