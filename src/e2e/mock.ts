import { consola } from 'consola'
import type { LogType } from 'consola'
import { useTestContext } from './context.ts'

export function mockFn() {
  const ctx = useTestContext()
  return ctx.mockFn
}

type MockLogs = Record<LogType, (...args: unknown[]) => void>

interface MockLogger extends MockLogs {
  /**
   * Returns a snapshot of the logger's full call history.
   * Useful after `clearMocks`. These mocks are for assertions only (no-op).
   * Overriding the mockLogger's mock or its implementation stops tracking new calls.
   */
  getSnapshot: () => MockLogs
}

/**
 * Mocks the Nuxt logger for e2e testing in the fixture or build phase.
 * Automatically restores the original logger during the test teardown phase.
 *
 * @example
 * ```ts
 * await setup({})
 * const logger = mockLogger()
 *
 * it('logging', () => {
 *   expect(logger.info).toHaveBeenCalledWith('## info log ##')
 *   // Useful if global clearMocks is enabled (e.g., Vitest default)
 *   const snapshot = logger.getSnapshot()
 *   expect(snapshot.info).toHaveBeenCalledWith('## info log ##')
 * })
 * ```
 */
export function mockLogger(): MockLogger {
  const fn = mockFn()
  const ctx = useTestContext()

  if (!fn) {
    throw new Error(`mockLogger is not supported in ${ctx.options.runner}.`)
  }

  const original = { ...consola }
  const types = Object.keys(consola.options.types) as LogType[]
  const calls = {} as Record<LogType, unknown[][]>
  const mocks = {
    getSnapshot: () => {
      const snapshot = {} as MockLogs
      for (const type of types) {
        const mock = fn()
        calls[type].forEach(args => mock(...args))
        snapshot[type] = mock
      }
      return snapshot
    },
  } satisfies Omit<MockLogger, LogType> as MockLogger

  for (const type of types) {
    calls[type] = []
    mocks[type] = fn((...args) => {
      calls[type].push(args)
      return original[type](...args as [unknown])
    })
  }

  consola.mockTypes(type => mocks[type])

  ctx.teardown ??= []
  ctx.teardown.unshift(() => {
    consola._mockFn = original._mockFn
    for (const type of types) {
      consola[type] = original[type]
    }
  })

  return mocks
}
