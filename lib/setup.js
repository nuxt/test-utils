const request = require('request-promise-native')
const getPort = require('get-port')
const build = require('./build')

let port

const url = path => `http://localhost:${port}${path}`
const get = (path, options = {}) => request({ url: url(path), ...options })
const loadConfig = (dir, fixture = null) => require(`${dir}/fixture/${fixture ? fixture + '/' : ''}nuxt.config`)

const setup = async (config, _port = null) => {
  const { nuxt, builder } = await build(config)

  port = _port
  if (!port) {
    port = await getPort()
  }

  await nuxt.listen(port)

  return {
    nuxt,
    builder
  }
}

module.exports = {
  setup,
  url,
  get,
  loadConfig
}
