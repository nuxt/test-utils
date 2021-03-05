import consola from 'consola'

module.exports = {
  srcDir: __dirname,

  modules: [
    '~/modules/module-a'
  ],

  hooks: {
    build: {
      done () {
        consola.warn('foo')
        consola.withTag('build').error('bar')
      }
    }
  }
}
