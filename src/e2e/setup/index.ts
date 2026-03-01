import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { createTestContext, setTestContext } from '../context'
import { buildFixture, loadFixture } from '../nuxt'
import { startServer, stopServer } from '../server'
import { createBrowser } from '../browser'
import type { TestHooks, TestOptions } from '../types'
import setupBun from './bun'
import setupCucumber from './cucumber'
import setupJest from './jest'
import setupVitest from './vitest'

const A11Y_BASE_DIR = join(tmpdir(), '.nuxt-test-a11y')

function getSignalPath(key: string): string {
  const hash = createHash('md5').update(key).digest('hex').slice(0, 12)
  return join(A11Y_BASE_DIR, `signal-${hash}`)
}

export const setupMaps = {
  bun: setupBun,
  cucumber: setupCucumber,
  jest: setupJest,
  vitest: setupVitest,
}

export function createTest(options: Partial<TestOptions>): TestHooks {
  const ctx = createTestContext(options)

  const beforeEach = () => {
    setTestContext(ctx)
  }

  const afterEach = () => {
    setTestContext(undefined)
  }

  const afterAll = async () => {
    if (ctx.a11y) {
      const results = ctx.a11y.getResults()
      const routes = Object.keys(results)
      if (routes.length > 0) {
        let totalViolations = 0
        const allViolations: unknown[] = []
        for (const result of Object.values(results)) {
          totalViolations += result.violationCount
          allViolations.push(...result.violations)
        }

        const signalPath = getSignalPath(process.cwd())
        const reporterActive = existsSync(signalPath)

        if (reporterActive) {
          try {
            const runId = readFileSync(signalPath, 'utf-8').trim()
            const runDir = join(A11Y_BASE_DIR, runId)
            mkdirSync(runDir, { recursive: true })
            const a11yOptions = typeof ctx.options.a11y === 'object' ? ctx.options.a11y : {}
            const data = {
              projectName: ctx.playwrightProjectName || '',
              threshold: a11yOptions.threshold ?? 0,
              routeCount: routes.length,
              totalViolations,
              violations: allViolations,
            }
            const fileName = `worker-${process.pid}-${Date.now()}.json`
            writeFileSync(join(runDir, fileName), JSON.stringify(data), 'utf-8')
          }
          catch {
            // fall through — reporter will see partial data
          }
        }
        else {
          console.log(`[@nuxt/a11y] Scanned ${routes.length} route(s) \u2014 ${totalViolations} violation(s)`)
          if (ctx.a11y.exceedsThreshold()) {
            let detail = ''
            try {
              const { formatViolations } = await import('@nuxt/a11y/test-utils')
              detail = '\n\n' + formatViolations(allViolations as Parameters<typeof formatViolations>[0])
            }
            catch {
              // formatViolations is optional
            }
            throw new Error(`[@nuxt/a11y] Violation count (${totalViolations}) exceeds threshold` + detail)
          }
        }
      }
    }

    if (ctx.serverProcess) {
      setTestContext(ctx)
      await stopServer()
      setTestContext(undefined)
    }
    if (ctx.nuxt && ctx.nuxt.options.dev) {
      await ctx.nuxt.close()
    }
    if (ctx.browser) {
      await ctx.browser.close()
    }
    // clear side effects
    await Promise.all(!ctx.teardown ? [] : ctx.teardown.map(fn => fn()))
  }

  const beforeAll = async () => {
    if (ctx.options.fixture) {
      await loadFixture()
    }

    if (ctx.options.build) {
      await buildFixture()
    }

    if (ctx.options.server) {
      await startServer(ctx.options.env)
    }

    if (ctx.options.waitFor) {
      await (new Promise(resolve => setTimeout(resolve, ctx.options.waitFor)))
    }

    if (ctx.options.a11y) {
      try {
        const { createAutoScan } = await import('@nuxt/a11y/test-utils')
        const a11yOptions = typeof ctx.options.a11y === 'object' ? ctx.options.a11y : {}
        ctx.a11y = createAutoScan(a11yOptions)
      }
      catch {
        throw new Error('setup({ a11y: true }) requires @nuxt/a11y to be installed')
      }
    }

    if (ctx.options.browser) {
      await createBrowser()
    }
  }

  return {
    beforeEach,
    afterEach,
    afterAll,
    beforeAll,
    setup: beforeAll,
    ctx,
  }
}

export async function setup(options: Partial<TestOptions> = {}) {
  const hooks = createTest(options)

  const setupFn = setupMaps[hooks.ctx.options.runner]

  await setupFn(hooks)
}
