const originalConfig = require('./nuxt.config')

module.exports = () => Promise.resolve(originalConfig())
