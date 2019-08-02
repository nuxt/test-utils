const { setup, loadConfig, get } = require('..')

describe('setup', () => {
  let nuxt

  beforeAll(async () => {
    ({ nuxt } = await setup(loadConfig(__dirname)))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', async () => {
    const html = await get('/')
    expect(html).toContain('Works!')
  })
})
