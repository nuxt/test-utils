const { build, loadConfig } = require('..')

describe('build', () => {
  let nuxt, builder

  beforeAll(async () => {
    ({ nuxt, builder } = await build(loadConfig(__dirname)))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', () => {
    expect(builder._buildStatus).toBe(2)
  })
})
