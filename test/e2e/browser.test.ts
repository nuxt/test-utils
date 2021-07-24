import { setupTest, createPage } from '../../src'

describe('browser', () => {
  setupTest({
    rootDir: 'test/fixtures/basic'
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const body = await page.innerHTML('body')
    expect(body).toContain('Works!')
  })
})

describe('browser type', () => {
  setupTest({
    rootDir: 'test/fixtures/basic',
    browserOptions: {
      // @ts-expect-error
      type: 'foo'
    }
  })

  test('should be error if invalid browser type', () => {
    expect(createPage()).rejects.toEqual(new Error('Invalid browser \'foo\''))
  })
})
