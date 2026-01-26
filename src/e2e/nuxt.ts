import { existsSync, promises as fsp } from 'node:fs'
import { resolve } from 'node:path'
import { defu } from 'defu'
import { useTestContext } from './context'
import { loadKit } from '../utils'

const isNuxtApp = (dir: string) => {
  return existsSync(dir) && (
    existsSync(resolve(dir, 'pages'))
    || existsSync(resolve(dir, 'nuxt.config.js'))
    || existsSync(resolve(dir, 'nuxt.config.mjs'))
    || existsSync(resolve(dir, 'nuxt.config.cjs'))
    || existsSync(resolve(dir, 'nuxt.config.ts'))
    || existsSync(resolve(dir, '.config', 'nuxt.js'))
    || existsSync(resolve(dir, '.config', 'nuxt.mjs'))
    || existsSync(resolve(dir, '.config', 'nuxt.cjs'))
    || existsSync(resolve(dir, '.config', 'nuxt.ts'))
  )
}

const resolveRootDir = () => {
  const { options } = useTestContext()

  const dirs = [
    options.rootDir,
    resolve(options.testDir, options.fixture),
    process.cwd(),
  ]

  for (const dir of dirs) {
    if (dir && isNuxtApp(dir)) {
      return dir
    }
  }

  throw new Error('Invalid nuxt app. (Please explicitly set `options.rootDir` pointing to a valid nuxt app)')
}

export async function loadFixture() {
  const ctx = useTestContext()

  ctx.options.rootDir = resolveRootDir()

  if (!ctx.options.dev) {
    const randomId = Math.random().toString(36).slice(2, 8)
    const buildDir = ctx.options.buildDir || resolve(ctx.options.rootDir, '.nuxt', 'test', randomId)
    ctx.options.nuxtConfig = defu(ctx.options.nuxtConfig, {
      buildDir,
      nitro: {
        output: {
          dir: resolve(buildDir, 'output'),
        },
      },
    })
  }

  // TODO: share Nuxt instance with running Nuxt if possible
  if (ctx.options.build) {
    const { loadNuxt } = await loadKit(ctx.options.rootDir)
    ctx.nuxt = await loadNuxt({
      cwd: ctx.options.rootDir,
      dev: ctx.options.dev,
      overrides: ctx.options.nuxtConfig,
      configFile: ctx.options.configFile,
    })

    const buildDir = ctx.nuxt.options.buildDir
    // avoid creating / deleting build dirs that already exist - avoids misconfiguration deletes
    if (!existsSync(buildDir)) {
      await fsp.mkdir(buildDir, { recursive: true })
      ctx.teardown = ctx.teardown || []
      ctx.teardown.push(() => fsp.rm(buildDir, { recursive: true, force: true }))
    }
  }
}

export async function buildFixture() {
  const ctx = useTestContext()
  const { buildNuxt, logger } = await loadKit(ctx.options.rootDir)

  // Hide build info for test
  const prevLevel = logger.level
  logger.level = ctx.options.logLevel
  await buildNuxt(ctx.nuxt!)
  logger.level = prevLevel
}
