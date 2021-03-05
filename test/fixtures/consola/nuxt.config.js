import consola from 'consola'

module.exports = {
  hooks: {
    build: {
      done () {
        consola.warn('foo')
      }
    }
  }
}
