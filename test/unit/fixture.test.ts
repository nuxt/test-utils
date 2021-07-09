import { join } from 'path'
import { loadFixture } from '../../src/nuxt'
import { getContext, NuxtTestContext } from '../../src/context'

const defaults = {
  testDir: 'test',
  fixture: 'fixtures/basic',
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
  randomId: () => 'test1234'
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

      expect(context.options.config.buildDir).toBe(join('.nuxt', 'test1234'))
    })

    test('if `buildDir` option is set', async () => {
      const context = getContext()
      context.options = {
        ...defaults,
        config: { buildDir: 'nuxt-build' }
      }

      await loadFixture()

      expect(context.options.config.buildDir).toBe(join('nuxt-build', 'test1234'))
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
