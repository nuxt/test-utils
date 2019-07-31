const { setupNuxt, loadFixture, get } = require('..')

describe('basic', () => {
  let nuxt

  beforeAll(async () => {
    nuxt = await setupNuxt(loadFixture(__dirname))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', async () => {
    const html = await get('/')
    expect(html).toContain('Works!')
  })
})
