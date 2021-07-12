const jiti = require('jiti')()

module.exports = {
  process (source, filename) {
    return jiti.transform({
      source,
      filename,
      ts: !!filename.match(/.ts$/),
      babel: {
        plugins: [require('babel-plugin-jest-hoist')]
      }
    })
  }
}
