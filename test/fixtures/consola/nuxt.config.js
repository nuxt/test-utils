import consola from 'consola'

consola.warn('foo')
consola.withTag('build').error('bar')

export default {
  srcDir: __dirname
}
