import { loadFixture } from '../../src/nuxt'
import { getContext, NuxtTestContext } from '../../src/context'

const defaults = {
  testDir: 'test',
  fixture: 'fixtures/basic',
  randomPort: true,
  server: true
}

let mockContext: Partial<NuxtTestContext> = {}

jest.mock('../../src/context', () => ({
  getContext: () => mockContext
}))

beforeEach(() => {
  mockContext = {}
})

describe('fixture', () => {
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
