const { Nuxt } = require('./nuxt')

module.exports = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()

  return nuxt
}
