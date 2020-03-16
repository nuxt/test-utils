module.exports = (function () {
  try {
    return require('nuxt')
  } catch (e) {
    return require('nuxt-edge')
  }
}())
