const { readFileSync } = require('fs')
const { resolve } = require('path')
const { generate, loadConfig } = require('..')

describe('generate', () => {
  let nuxt

  beforeAll(async () => {
    ({ nuxt } = await generate(loadConfig(__dirname)))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', () => {
    const html = readFileSync(resolve(__dirname, 'fixture/dist/index.html'), 'utf8')
    expect(html).toContain('Works!')
  })
})
