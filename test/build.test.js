const { buildNuxt, loadFixture } = require('..')

describe('build', () => {
  let nuxt

  beforeAll(async () => {
    nuxt = await buildNuxt(loadFixture(__dirname))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', () => {
    expect(nuxt.builder._buildStatus).toBe(2)
  })
})
