const { Builder } = require('./nuxt')
const init = require('./init')

module.exports = async (config, { waitFor = 0, beforeNuxtReady = null } = {}) => {
  const nuxt = await init(config, { beforeNuxtReady })

  const builder = new Builder(nuxt)
  await builder.build()

  await (new Promise(resolve => setTimeout(resolve, waitFor)))

  return {
    nuxt,
    builder
  }
}
