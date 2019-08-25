const deepmerge = require('deepmerge')
const request = require('request-promise-native')
const getPort = require('get-port')
const build = require('./build')

let _port

const url = path => `http://localhost:${_port}${path}`
const get = (path, options = {}) => request({ url: url(path), ...options })

const loadConfig = (dir, fixture = null, override = {}, { merge = false } = {}) => {
  const config = require(`${dir}/fixture/${fixture ? fixture + '/' : ''}nuxt.config`)

  if (merge) {
    return deepmerge.all([config, override])
  } else {
    return {
      ...config,
      ...override
    }
  }
}

const setup = async (config, { port = null, waitFor = 0 } = {}) => {
  const { nuxt, builder } = await build(config, { waitFor })

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
