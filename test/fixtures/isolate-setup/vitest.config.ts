import { distDir } from '#dirs'
import { resolve } from 'node:path'

import { defineVitestConfig } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'

const browserEnabled = process.argv.some(x => x.includes('--browser.enabled'))
const setupNuxtPath = resolve(distDir, '../src/runtime/shared/nuxt.ts').replaceAll('\\', '/')

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: browserEnabled
      ? ['./test/**/*.nuxt.spec.ts']
      : ['./test/**/*.nuxt.spec.ts', './test/**/*.node.spec.ts'],
    maxWorkers: 1,
    browser: {
      enabled: browserEnabled,
      headless: true,
      screenshotFailures: false,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    ui: false,
    onConsoleLog(log) {
      if (log.includes('<Suspense> is an experimental feature')) {
        return false
      }
    },
  },
  plugins: [{
    name: 'fixtures:isolate-setup:replace-test-setup-nuxt',
    enforce: 'pre',
    transform(code, id) {
      if (id !== setupNuxtPath) return
      const failOnSetupBefore = process.env.ERROR_TEST_PATTERN === 'before'
      const failOnSetupAfter = process.env.ERROR_TEST_PATTERN === 'after'
      return code
        .replace(/export async function setupNuxt/, 'async function _setupNuxt')
        .concat(`
export async function setupNuxt(...args) {
  window.__setup_calls__ ??= 0
  window.__setup_calls__ += 1
  console.log(\`### setupNuxt called ### \${window.__setup_calls__}\`)
  
  if (window.__setup_calls__ === 1) {
    if (${failOnSetupBefore}) {
      throw new Error('#### setupNuxt failed before ###')
    } else if (${failOnSetupAfter}) {
      await _setupNuxt(...args)
      throw new Error('#### setupNuxt failed after ###')
    }
  }

  return _setupNuxt(...args)
}
`)
    },
  }],
})
