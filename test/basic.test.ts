import { setupTest, createPage, get, NuxtTestContext } from '../src'

describe('basic', () => {
  const ctx: NuxtTestContext = setupTest({
    __dirname,
    fixture: 'fixtures/basic',
    browser: true,
    waitFor: 100
  })

  test('request page', async () => {
    const { body } = await get('/')
    expect(body).toContain('Works!')
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const html = await page.getHtml()
    expect(html).toContain('Works!')
  })

  test('should be added plugin', () => {
    expect(ctx).toHaveCalledNuxtAddPlugin({
      src: expect.stringContaining('plugin.js'),
      fileName: 'plugin-a.js',
      options: {}
    })
  })

  test('should be added layout', () => {
    expect(ctx).toHaveCalledNuxtAddLayout(expect.stringContaining('layout.vue'))
    expect(ctx).toHaveCalledNuxtAddLayout(expect.stringContaining('layout.vue'), 'name-layout')
  })

  test('should be added error layout', () => {
    expect(ctx).toHaveCalledNuxtAddErrorLayout(expect.stringContaining('error'))
  })

  test('should be added middleware', () => {
    expect(ctx).toHaveCalledNuxtAddServerMiddleware(expect.stringContaining('middleware.js'))
  })

  test('should be require module', () => {
    expect(ctx).toHaveCalledNuxtRequireModule('~/modules/module-b')
  })
})
