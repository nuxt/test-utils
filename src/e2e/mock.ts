import { consola, Consola, LogTypes } from 'consola'
import type { ConsolaInstance, LogType } from 'consola'
import { useTestContext } from './context.ts'

export function mockFn() {
  const ctx = useTestContext()
  return ctx.mockFn
}

type MockLogs = Record<LogType, ConsolaInstance[LogType]>

interface MockLoggerOptions {
  /**
   * Calls the original logger methods in addition to recording mock calls.
   * @default false
   */
  spy?: boolean
}

interface MockLogger extends MockLogs {
  /**
   * Returns a snapshot of the logger's full call history.
   * Useful after `clearMocks`. These mocks are for assertions only (no-op).
   * Overriding the mockLogger's mock or its implementation stops tracking new calls.
   */
  getSnapshot: () => MockLogs
  /**
   * Returns a mock logger scoped to the specified tag (or untagged logs if omitted).
   *
   * @example
   * ```ts
   * const mock = mockLogger()
   * useLogger('t1').info('mock info log by t1')
   * expect(mock.getWithTag('t1').info).toHaveBeenCalledWith('mock info log by t1')
   * ```
   */
  getWithTag: (tag?: string) => Omit<MockLogger, 'getWithTag' | 'restoreOriginal'>
  /**
   * Restores the original logger methods and stops mocking newly created loggers.
   */
  restoreOriginal: () => void
}

/**
 * Mocks the Nuxt logger for e2e testing in the fixture or build phase.
 * Automatically restores the original logger during the test teardown phase.
 *
 * @example
 * ```ts
 * import { mockLogger, setup } from '@nuxt/test-utils/e2e'
 *
 * await setup({})
 * const logger = mockLogger()
 *
 * it('logging', () => {
 *   expect(logger.info).toHaveBeenCalledWith('info log')
 *   expect(logger.info).not.toHaveBeenCalledWith('info log raw')
 *   expect(logger.info.raw).toHaveBeenCalledWith('info log raw')
 *   // Useful if global clearMocks is enabled (e.g., Vitest default)
 *   const snapshot = logger.getSnapshot()
 *   expect(snapshot.info).toHaveBeenCalledWith('info log')
 *   expect(snapshot.info.raw).toHaveBeenCalledWith('info log raw')
 * })
 * ```
 */
export function mockLogger(options: MockLoggerOptions = {}): MockLogger {
  const fn = mockFn()
  const ctx = useTestContext()

  if (!fn) {
    throw new Error(`mockLogger is not supported in ${ctx.options.runner}.`)
  }

  const mockLogger = createMockLogger(fn, options)

  ctx.teardown ??= []
  ctx.teardown.unshift(mockLogger.restoreOriginal)

  return mockLogger
}

function createMockLogger(
  fn: NonNullable<ReturnType<typeof mockFn>>,
  options: MockLoggerOptions,
): MockLogger {
  const createInstance = Consola.prototype.create

  const cleanupFns = [() => {
    Consola.prototype.create = createInstance
  }]

  const cleanup = () => cleanupFns.forEach(fn => fn())

  const registry = createMockLoggerRegistry(fn)

  const applyMockFn = (instance: ConsolaInstance) => {
    const original = { ...instance }
    const types = Object.keys(instance.options.types) as LogType[]

    const { log, raw } = registry.withTag(instance.options.defaults.tag ?? '')

    for (const type of types) {
      instance[type] = mockConsolaLog(
        fn((...args: [unknown]) => {
          log(type, args)
          if (options.spy) {
            original[type](...args)
          }
        }),
        fn((...args) => {
          raw(type, args)
          if (options.spy) {
            original[type].raw(...args)
          }
        }),
      )
    }

    cleanupFns.unshift(() => types.forEach((type) => {
      instance[type] = original[type]
    }))

    return instance
  }

  Consola.prototype.create = function (this: ConsolaInstance, ...args) {
    return applyMockFn(createInstance.call(this, ...args))
  }

  applyMockFn(consola)

  const toMockLogger = (registry: MockLoggerRegistry): MockLogger => {
    const methods: Omit<MockLogger, keyof MockLogs> = {
      getSnapshot: registry.snapshot,
      getWithTag: tag => toMockLogger(registry.withTag(tag)),
      restoreOriginal: cleanup,
    }
    return new Proxy(registry.mocks as MockLogger, {
      get(target, p, receiver) {
        return Reflect.get(methods, p, receiver) ?? Reflect.get(target, p, receiver)
      },
      has(target, p) {
        return Reflect.has(methods, p) || Reflect.has(target, p)
      },
      ownKeys(target) {
        return [...new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(methods)])]
      },
      getOwnPropertyDescriptor(target, p) {
        return Reflect.getOwnPropertyDescriptor(methods, p) ?? Reflect.getOwnPropertyDescriptor(target, p)
      },
    })
  }

  return toMockLogger(registry)
}

interface MockLoggerRegistry {
  mocks: MockLogs
  log: (type: LogType, args: [unknown, ...unknown[]]) => void
  raw: (type: LogType, args: unknown[]) => void
  snapshot: () => MockLogs
  withTag: (tag?: string) => MockLoggerRegistry
}

function createMockLoggerRegistry(
  fn: NonNullable<ReturnType<typeof mockFn>>,
  parent?: MockLoggerRegistry,
): MockLoggerRegistry {
  const mocks = {} as MockLogs
  const calls = {} as Record<LogType, {
    log: [unknown, ...unknown[]][]
    raw: unknown[][]
  }>
  const tags = new Map<string, MockLoggerRegistry>()

  const init = (type: LogType) => {
    calls[type] ??= { log: [], raw: [] }
    mocks[type] ??= mockConsolaLog(fn(), fn())
  }

  Object.keys(LogTypes).forEach(type => init(type as LogType))

  const registry: MockLoggerRegistry = {
    mocks,
    log: (type, args) => {
      init(type)
      mocks[type](...args)
      calls[type].log.push(args)
      parent?.log(type, args)
    },
    raw: (type, args) => {
      init(type)
      mocks[type].raw(...args)
      calls[type].raw.push(args)
      parent?.raw(type, args)
    },
    snapshot: () => {
      const snapshot = {} as MockLogs
      for (const type of Object.keys(calls) as LogType[]) {
        const mock = mockConsolaLog(fn(), fn())
        calls[type].log.forEach(args => mock(...args))
        calls[type].raw.forEach(args => mock.raw(...args))
        snapshot[type] = mock
      }
      return snapshot
    },
    withTag: (tag) => {
      const withTag = tags.get(tag ?? '') ?? createMockLoggerRegistry(fn, registry)
      tags.set(tag ?? '', withTag)
      return withTag
    },
  }

  return registry
}

function mockConsolaLog(_fn: Omit<ConsolaInstance[LogType], 'raw'>, raw: ConsolaInstance[LogType]['raw']) {
  const fn = _fn as unknown as ConsolaInstance[LogType]
  fn.raw = raw
  return fn
}
