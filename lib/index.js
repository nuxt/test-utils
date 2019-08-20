const { setup, url, get, loadConfig } = require('./setup')
const build = require('./build')
const generate = require('./generate')
const init = require('./init')

module.exports = {
  init,
  setup,
  build,
  generate,
  url,
  get,
  loadConfig
}
