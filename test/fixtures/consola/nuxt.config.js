import consola from 'consola'

consola.warn('foo')
consola.withTag('build').error('bar')

module.exports = {
  srcDir: __dirname
}
