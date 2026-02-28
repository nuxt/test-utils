import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'

await setup({
  runner: 'cucumber',
  server: true,
  browser: true,
  a11y: true,
  rootDir: fileURLToPath(new URL('../../../..', import.meta.url)),
})
