import { setupTest, createPage } from '../src'

describe('basic', () => {
  setupTest({
    testDir: __dirname,
    fixture: 'fixtures/basic',
    browser: true
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const html = await page.textContent('body')
    expect(html).toContain('Works!')
  })
})

describe('second describe', () => {
  setupTest({
    testDir: __dirname,
    fixture: 'fixtures/basic'
  })
})
