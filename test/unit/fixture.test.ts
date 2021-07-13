import { join } from 'path'
import { loadFixture } from '../../src/nuxt'
import { getContext } from '../../src/context'
import { NuxtTestContext } from '../../src/types'

const defaults = {
  rootDir: '.',
  randomPort: true,
  randomBuildDir: true,
  build: true,
  server: true
}

const mockContext: Partial<NuxtTestContext> = {}

jest.mock('../../src/context', () => ({
  getContext: () => mockContext
}))

jest.mock('../../src/utils', () => ({
  randomId: () => 'mock-random-string',
  ensureNuxtApp: () => Promise.resolve()
}))

beforeEach(() => {
  mockContext.options = {}
})

describe('fixture', () => {
  describe('randomBuildDir', () => {
    test('by default', async () => {
      const context = getContext()
      context.options = {
        ...defaults
      }

      await loadFixture()

      expect(context.options.config.buildDir).toBe(join('.nuxt', 'mock-random-string'))
    })

    test('if `buildDir` option is set', async () => {
      const context = getContext()
      context.options = {
        ...defaults,
        config: { buildDir: 'nuxt-build' }
      }

      await loadFixture()

      expect(context.options.config.buildDir).toBe(join('nuxt-build', 'mock-random-string'))
    })

    test('if `randomBuildDir: false` is set', async () => {
      const context = getContext()
      context.options = {
        ...defaults,
        randomBuildDir: false
      }

      await loadFixture()

      expect(context.options.config.buildDir).toBeUndefined()
    })

    test('if `build: false` is set', async () => {
      const context = getContext()
      context.options = {
        ...defaults,
        build: false
      }

      await loadFixture()

      expect(context.options.config.buildDir).toBeUndefined()
    })
  })

  describe('randomPort', () => {
    test('by default', async () => {
      const context = getContext()
      context.options = {
        ...defaults
      }

      await loadFixture()

      expect(context.options.config.server?.port).toBe(0)
    })

    test('if `server.port` option is set', async () => {
      const context = getContext()
      context.options = {
        ...defaults,
        config: { server: { port: 5050 } }
      }

      await loadFixture()

      expect(context.options.config.server?.port).toBe(0)
    })

    test('if `randomPort: false` is set', async () => {
      const context = getContext()
      context.options = {
        ...defaults,
        config: { server: { port: 5050 } },
        randomPort: false
      }

      await loadFixture()

      expect(context.options.config.server.port).toBe(5050)
    })

    test('if `server: false` is set', async () => {
      const context = getContext()
      context.options = {
        ...defaults,
        server: false
      }

      await loadFixture()

      expect(context.options.config.server).toBeUndefined()
    })
  })
})
