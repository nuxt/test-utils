import consola from 'consola'

module.exports = {
  hooks: {
    build: {
      done () {
        consola.withTag('build').error('bar')
      }
    }
  }
}
