const { setup, loadConfig, url } = require('..')

describe('custom port', () => {
  let nuxt

  beforeAll(async () => {
    ({ nuxt } = await setup(loadConfig(__dirname), { port: 4444 }))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', () => {
    expect(url('/')).toBe('http://localhost:4444/')
  })
})
