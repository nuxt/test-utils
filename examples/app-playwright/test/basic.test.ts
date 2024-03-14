import { fileURLToPath } from 'node:url'
import { test } from '@playwright/test'
import { setup, url } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
})

test('test', async ({ page }) => {
  await page.goto(url('/'))
  test.expect(await page.getByRole('heading').innerText()).toBe('Welcome to Playwright!')
})
