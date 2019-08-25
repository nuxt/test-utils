const { setup, loadConfig, get } = require('..')

describe('setup', () => {
  let nuxt

  beforeAll(async () => {
    ({ nuxt } = await setup(loadConfig(__dirname, 'setup')))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', async () => {
    const html = await get('/')
    expect(html).toContain('Works!')
  })
})

describe('loadConfig', () => {
  test('override (replace)', () => {
    const override = {
      env: {
        ENV2: 'true'
      }
    }
    const config = loadConfig(__dirname, 'setup', override)
    expect(config.env).toEqual({ ENV2: 'true' })
  })

  test('override (merge)', () => {
    const override = {
      env: {
        ENV2: 'true'
      }
    }
    const config = loadConfig(__dirname, 'setup', override, { merge: true })
    expect(config.env).toEqual({ ENV1: 'true', ENV2: 'true' })
  })
})
