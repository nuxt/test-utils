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
    fsModuleCache: true,
    globalSetup: './global.setup.ts',
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
      return 'import { inject } from "vitest";\n' + code
        .replace(/export async function setupNuxt/, 'async function _setupNuxt')
        .concat(`
export async function setupNuxt(...args) {
  window.__setup_calls__ ??= 0
  window.__setup_calls__ += 1

  const workerId = import.meta.env.VITEST_WORKER_ID ?? 'undefined'
  console.log(\`### setupNuxt called ### \${window.__setup_calls__}:\${workerId}\`)
  
  if (window.__setup_calls__ === 1) {
    if (inject('testPattern') === 'before') {
      throw new Error('#### setupNuxt failed before ###')
    } else if (inject('testPattern') === 'after') {
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
