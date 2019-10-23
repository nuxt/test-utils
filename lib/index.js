const build = require('./build')
const generate = require('./generate')
const init = require('./init')
const loadConfig = require('./load-config')
const { setup, url, get } = require('./setup')

module.exports = {
  build,
  generate,
  get,
  init,
  loadConfig,
  setup,
  url
}
