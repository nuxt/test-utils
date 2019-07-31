const request = require('request-promise-native')
const getPort = require('get-port')
const { Nuxt, Builder, Generator } = require('./nuxt')

let port

const url = path => `http://localhost:${port}${path}`
const get = path => request(url(path))
const loadFixture = (dir, fixture = null) => require(`${dir}/fixture/${fixture ? fixture + '/' : ''}nuxt.config`)

const setupNuxt = async (config, _port = null) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()

  port = _port
  if (!port) {
    port = await getPort()
  }

  await nuxt.listen(port)

  return nuxt
}

const buildNuxt = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()

  return nuxt
}

const generateNuxt = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()

  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)
  await generator.generate()

  return nuxt
}

module.exports = {
  setupNuxt,
  buildNuxt,
  generateNuxt,
  loadFixture,
  url,
  get
}
