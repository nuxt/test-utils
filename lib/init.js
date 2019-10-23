const { Nuxt } = require('./nuxt')

module.exports = async (config, { beforeNuxtReady = null } = {}) => {
  const nuxt = new Nuxt(config)

  if (beforeNuxtReady) {
    await beforeNuxtReady(nuxt)
  }

  await nuxt.ready()

  return nuxt
}
