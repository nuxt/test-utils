const build = require('./build')
const { generatePort } = require('./generate-port')

module.exports = async (config, { port = null, waitFor = 0, beforeNuxtReady = null } = {}) => {
  const { nuxt, builder } = await build(config, { waitFor, beforeNuxtReady })

  await nuxt.listen(await generatePort(port))

  return {
    nuxt,
    builder
  }
}
