const build = require('./build')
const { generatePort } = require('./generate-port')

module.exports = async (config, { port = null, waitFor = 0, beforeNuxtReady = null } = {}) => {
  const _port = await generatePort(config.server && config.server.port ? config.server.port : port)
  const { nuxt, builder } = await build(Object.assign(config, { server: { port: _port } }), { waitFor, beforeNuxtReady })

  await nuxt.listen(_port)

  return {
    nuxt,
    builder
  }
}
