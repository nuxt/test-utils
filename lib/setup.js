const request = require('request-promise-native')
const getPort = require('get-port')
const build = require('./build')

let _port

const url = path => `http://localhost:${_port}${path}`
const get = (path, options = {}) => request({ url: url(path), ...options })
const loadConfig = (dir, fixture = null) => require(`${dir}/fixture/${fixture ? fixture + '/' : ''}nuxt.config`)

const setup = async (config, port = null) => {
  const { nuxt, builder } = await build(config)

  _port = port
  if (!_port) {
    _port = await getPort()
  }

  await nuxt.listen(_port)

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
