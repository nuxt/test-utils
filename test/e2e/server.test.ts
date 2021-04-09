import { resolve } from 'path'
import { createServer } from 'http'
import { setupTest, getContext, getNuxt } from '../../src'
import { get } from '../../src/server'

const baseConfig = {
  testDir: resolve(__dirname, '..'),
  fixture: 'fixtures/server'
}

describe('server', () => {
  const port = 3000
  const anotherServer = createServer()

  beforeAll(() => {
    anotherServer.listen({ host: 'localhost', port })
  })
  afterAll(() => {
    anotherServer.close()
  })

  describe('by default', () => {
    setupTest({
      ...baseConfig,
      server: true
    })

    test('listens on a random unused port', () => {
      const { url } = getContext()
      expect(url).toBeDefined()
      expect(url).not.toContain(`localhost:${port}`)
    })
  })

  describe('uses `config.server.port` value', () => {
    setupTest({
      ...baseConfig,
      config: { server: { port } }
    })

    test('if port is already taken throws an error', async () => {
      expect.assertions(1)
      const nuxt = getNuxt()

      try {
        await nuxt.listen()
      } catch (err) {
        expect(err).toBeDefined()
      }
    })
  })

  describe.each([
    [5050, 'an integer'],
    ['5050', 'a string which can be converted to a number']
  ])('uses `config.server.port` value', (port, msg) => {
    setupTest({
      ...baseConfig,
      server: true,
      config: { server: { port } }
    })

    test(`listens if the value is ${msg}`, () => {
      const { url } = getContext()
      expect(url).toContain('localhost:5050')
    })
  })

  describe.each([
    [-5050, 'negative number'],
    [50.50, 'a float'],
    ['fifty-fifty', 'a string which can not be converted to a number']
  ])('uses `config.server.port` value', (port, msg) => {
    setupTest({
      ...baseConfig,
      config: { server: { port } }
    })

    test(`throws if the value is ${msg}`, async () => {
      expect.assertions(1)
      const nuxt = getNuxt()

      try {
        await nuxt.listen()
      } catch (err) {
        expect(err).toBeDefined()
      }
    })
  }
  )
})

describe('`get()` helper', () => {
  describe('returns a response', () => {
    setupTest({
      ...baseConfig,
      server: true
    })

    test('for a path with leading slash', async () => {
      const { body } = await get('/some-path')
      expect(body).toContain('Some path')
    })

    test('for a path without leading slash', async () => {
      const { body } = await get('some-path')
      expect(body).toContain('Some path')
    })

    test('for a path with trailing slash', async () => {
      const { body } = await get('some-path/')
      expect(body).toContain('Some path')
    })
  })

  describe('throws an error', () => {
    setupTest(baseConfig)

    test('if server is not enabled', async () => {
      expect.assertions(1)
      try {
        await get('/')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    })
  })
})
