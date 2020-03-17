const request = require('request-promise-native')
const getPort = require('get-port')

let _port

const url = path => `http://localhost:${_port}${path}`
const get = (path, options = {}) => request({ url: url(path), ...options })

const generatePort = async (port) => {
  if (port) {
    _port = port
  }

  if (!_port) {
    _port = await getPort()
  }

  return _port
}

module.exports = {
  generatePort,
  get,
  url
}
