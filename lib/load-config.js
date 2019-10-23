const clonedeep = require('clone-deep')
const deepmerge = require('deepmerge')

module.exports = (dir, fixture = null, override = {}, { merge = false } = {}) => {
  const config = require(`${dir}/fixture/${fixture ? fixture + '/' : ''}nuxt.config`)

  if (merge) {
    return deepmerge.all([config, override])
  } else {
    return {
      ...clonedeep(config),
      ...clonedeep(override)
    }
  }
}
