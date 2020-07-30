import { setupTest, createPage, NuxtTestContext } from '../src'

describe('basic', () => {
  const ctx: NuxtTestContext = setupTest({
    __dirname,
    fixture: 'fixtures/basic',
    browser: true,
    waitFor: 100
  })

  test('should render page', async () => {
    const page = await createPage('/')
    const html = await page.getHtml()
    expect(html).toContain('Works!')
  })

  test('should be added plugin', () => {
    expect(ctx).toNuxtPluginAdded({
      src: expect.stringContaining('plugin.js'),
      fileName: 'plugin-a.js',
      options: {}
    })
  })

  test('should be added layout', () => {
    expect(ctx).toNuxtLayoutAdded(expect.stringContaining('layout.vue'))
    expect(ctx).toNuxtLayoutAdded(expect.stringContaining('layout.vue'), 'name-layout')
  })

  test('should be added error layout', () => {
    expect(ctx).toNuxtErrorLayoutAdded(expect.stringContaining('error'))
  })

  test('should be added middleware', () => {
    expect(ctx).toNuxtServerMiddlewareAdded(expect.stringContaining('middleware.js'))
  })

  test('should be require module', () => {
    expect(ctx).toNuxtRequireModule('~/modules/module-b')
  })
})
