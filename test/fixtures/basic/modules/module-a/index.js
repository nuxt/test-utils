const { resolve } = require('path')

module.exports = function (options) {
  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'plugin-a.js',
    options
  })

  this.addLayout(resolve(__dirname, 'layout.vue'))
  this.addLayout(resolve(__dirname, 'layout.vue'), 'name-layout')

  this.addLayout(resolve(__dirname, 'error.vue'), 'error')

  this.addServerMiddleware(resolve(__dirname, 'middleware.js'))

  this.requireModule('~/modules/module-b')
}
