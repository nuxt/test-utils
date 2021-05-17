import { get, createPage, setupTest } from '@nuxt/test-utils'

describe('index page', () => {
  setupTest({
    browser: true,
    server: true
  })

  test('renders the page', async () => {
    const { body } = await get('/')
    expect(body).toContain('The app works!')
  })

  test('navigates to some page', async () => {
    const page = await createPage('/')
    await page.click('text=Some page')

    expect(page.url()).toMatch('/some')
  })
})
