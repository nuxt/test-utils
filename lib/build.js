const { Builder } = require('./nuxt')
const init = require('./init')

module.exports = async (config, { waitFor = 0 } = {}) => {
  const nuxt = await init(config)

  const builder = new Builder(nuxt)
  await builder.build()

  await (new Promise(resolve => setTimeout(resolve, waitFor)))

  return {
    nuxt,
    builder
  }
}
