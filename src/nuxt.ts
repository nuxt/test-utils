import { resolve } from 'path'
import defu from 'defu'
import { getContext } from './context'

export async function loadNuxt () {
  const ctx = getContext()
  const { Nuxt } = await loadNuxtPackage()

  ctx.nuxt = new Nuxt(ctx.options.config)
}

function loadConfig () {
  const { options } = getContext()
  return (
    import(resolve(options.rootDir, options.configFile))
      // .then(m => /* istanbul ignore next */ m.default || m)
      .then(async (m) => {
        if (m.default) {
          m = m.default
        }

        if (typeof m === 'function') {
          try {
            m = await m()
            if (m.default) {
              m = m.default
            }
          } catch (error) {
            console.error(error)
            throw new Error('Error while fetching async configuration')
          }
        }

        return m
      })
  )
}

export async function loadFixture () {
  const { options } = getContext()

  options.rootDir = resolve(options.testDir, options.fixture)
  const loadedConfig = await loadConfig()

  options.config = defu(options.config, loadedConfig)

  if (!options.config.rootDir) {
    options.config.rootDir = options.rootDir
  }

  if (!options.config.buildDir) {
    const randomId = Math.random()
      .toString(36)
      .substr(2, 8)
    options.config.buildDir = resolve(options.rootDir, '.nuxt', randomId)
  }
}

export async function loadNuxtPackage (name: string = 'nuxt') {
  return await import(name + '-edge').catch(
    /* istanbul ignore next */ () => import(name)
  )
}

export function getNuxt () {
  const ctx = getContext()
  return ctx.nuxt
}
