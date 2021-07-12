import { readdir } from 'fs/promises'
import { resolve } from 'path'

const nuxtDir = ['nuxt.config.js', 'nuxt.config.ts', 'pages']
const fixtureError = 'Make sure \'rootDir\' or \'fixture\' option is pointing to a location which at least contains \'nuxt.config\' file or \'pages\' directory.'

export const ensureNuxtApp = async (dir: string) => {
  const targetDir = await readdir((resolve(dir)))
    .catch((_err) => {
      throw new Error(`Cannot read from '${resolve(dir)}'. ${fixtureError}`)
    })

  const isNuxtAppFound = nuxtDir.some(path => targetDir.includes(path))

  if (!isNuxtAppFound) {
    throw new Error(`Cannot find Nuxt app at '${resolve(dir)}'. ${fixtureError}`)
  }
}

export const randomId = () => {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 8)
}
