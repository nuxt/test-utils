import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, getBrowser, setRuntimeConfig, setup, url } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    browser: true,
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<span id="runtime">original value</span></div>')
  })

  it('changes runtime config client-side', async () => {
    const browser = await getBrowser()
    const page = await browser.newPage()
    await page.goto(url('/'))

    const el = page.locator('#runtime')
    expect(await el.innerText()).to.equal('original value')

    await page.evaluate(() => {
      window.__NUXT_TEST_RUNTIME_CONFIG_SETTER__({ public: { myValue: 'overwritten by test!' } })
    })

    expect(await el.innerText()).to.equal('overwritten by test!')
  })

  it('changes runtime config in server route', async () => {
    const originalConfig = await $fetch('/api/config')
    expect(originalConfig.public.myValue).to.equal('original value')

    await setRuntimeConfig({ public: { myValue: 'overwritten by test!' } })

    const newConfig = await $fetch('/api/config')
    expect(newConfig.public.myValue).to.equal('overwritten by test!')
  })

  it('changes runtime config', async () => {
    await setRuntimeConfig({ public: { myValue: 'overwritten by test!' } })

    const html = await $fetch('/')
    expect(html).toContain('<span id="runtime">overwritten by test!</span></div>')
  })
})
