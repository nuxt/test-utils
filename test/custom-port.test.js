const { setupNuxt, loadFixture, url } = require('..')

describe('custom port', () => {
  let nuxt, port

  beforeAll(async () => {
    port = 4444
    nuxt = await setupNuxt(loadFixture(__dirname), port)
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', () => {
    expect(url('/')).toBe(`http://localhost:${port}/`)
  })
})
