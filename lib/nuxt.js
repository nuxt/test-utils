module.exports = (function () {
  try {
    return require('nuxt')
  } catch (e) {
    try {
      return require('nuxt-edge')
    } catch (e) {
      throw e
    }
  }
}())
