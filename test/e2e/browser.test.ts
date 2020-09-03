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

describe('browser type', () => {
  setupTest({
    testDir: resolve(__dirname, '..'),
    fixture: 'fixtures/basic',
    browserOptions: {
      // @ts-ignore
      type: 'foo'
    }
  })

  test('should be error if invalid browser type', () => {
    expect(createPage()).rejects.toEqual(new Error('Invalid browser \'foo\''))
  })
})
