import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'
import type { ConfigOptions } from './customFixtures'

const nuxt = {
  rootDir: fileURLToPath(new URL('.', import.meta.url)),
}

export default defineConfig<ConfigOptions>({
  projects: [{
    name: 'Chromium',
    use: {
      browserName: 'chromium',
      nuxt,
    }
  }, {
    name: 'Firefox',
    use: {
      browserName: 'firefox',
      nuxt,
    }
  }, {
    name: 'WebKit',
    use: {
      browserName: 'webkit',
      nuxt,
    }
  }]
})
