import { resolve } from 'path'
import { setupTest, createPage } from '../../src'

describe('browser', () => {
  setupTest({
    testDir: resolve(__dirname, '..'),
    fixture: 'fixtures/basic',
    browser: true
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const body = await page.innerHTML('body')
    expect(body).toContain('Works!')
  })
})

describe('second describe', () => {
  setupTest({
    testDir: resolve(__dirname, '..'),
    fixture: 'fixtures/basic'
  })
})
