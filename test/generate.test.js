const { readFileSync } = require('fs')
const { resolve } = require('path')
const { generateNuxt, loadFixture } = require('..')

describe('generate', () => {
  let nuxt

  beforeAll(async () => {
    nuxt = await generateNuxt(loadFixture(__dirname, 'generate'))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', () => {
    const html = readFileSync(resolve(__dirname, 'fixture/generate/dist/index.html'), 'utf8')
    expect(html).toContain('Works!')
  })
})
