import { beforeEach, describe, expect, it, vi } from 'vitest'
import { logger, useLogger } from 'nuxt/kit'
import type { NuxtLogReporter } from 'nuxt/kit'

import type { TestContext } from '../../src/e2e.ts'
import { mockLogger } from '../../src/e2e'

type Context = {
  mockFn?: TestContext['mockFn']
  options?: Partial<TestContext['options']>
  teardown?: TestContext['teardown']
}

const { useTestContextMock } = vi.hoisted(() => ({
  useTestContextMock: vi.fn<() => Context>(),
}))

vi.mock(import('../../src/e2e/context.ts'), async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    useTestContext: useTestContextMock as unknown,
  } as typeof original
})

describe('mockLogger', () => {
  beforeEach(({ onTestFinished }) => {
    const context: Context = {
      mockFn: vi.fn,
      options: { runner: 'vitest' },
    }
    onTestFinished(() => context.teardown?.forEach(fn => fn()))
    useTestContextMock.mockReturnValue(context)
  })

  it('should throw error when testContext is not set', async () => {
    const { useTestContext } = await vi.importActual<typeof import('../../src/e2e/context.ts')>('../../src/e2e/context.ts')
    useTestContextMock.mockImplementation(useTestContext)
    expect(() => mockLogger()).toThrow('No context is available.')
  })

  it('should throw error when runner does not support mockFn', () => {
    useTestContextMock.mockImplementation(() => ({ options: { runner: 'cucumber' } }))
    expect(() => mockLogger()).toThrow('mockLogger is not supported in cucumber.')
  })

  it('can check logger logging', () => {
    const mock = mockLogger()

    logger.info('mock info log')
    logger.warn('mock warn log')

    expect(mock.info).toHaveBeenCalledExactlyOnceWith('mock info log')
    expect(mock.warn).toHaveBeenCalledExactlyOnceWith('mock warn log')
  })

  it('can check logger logging directly', () => {
    mockLogger()

    logger.info('mock info log')
    logger.warn('mock warn log')

    expect(logger.info).toHaveBeenCalledExactlyOnceWith('mock info log')
    expect(logger.warn).toHaveBeenCalledExactlyOnceWith('mock warn log')
  })

  it('can check useLogger logging', () => {
    const mock = mockLogger()

    const tagged = useLogger('tagged')
    tagged.info('mock info log')

    expect(mock.info).toHaveBeenCalledExactlyOnceWith('mock info log')
  })

  it('can check useLogger logging directly', () => {
    mockLogger()

    const tagged = useLogger('tagged')
    tagged.info('mock info log')

    expect(tagged.info).toHaveBeenCalledExactlyOnceWith('mock info log')
  })

  it('can check all logging via mockLogger', () => {
    const mock = mockLogger()

    logger.info('mock info log')
    useLogger('t1').info('mock info log')
    useLogger('t2').info('mock info log')

    expect(mock.info).toHaveBeenNthCalledWith(3, 'mock info log')
  })

  it('can restore original loggers', () => {
    const mock = mockLogger()

    const tagged1 = useLogger('t1')

    mock.restoreOriginal()

    const tagged2 = useLogger('t2')

    expect(vi.isMockFunction(logger.info)).toBe(false)
    expect(vi.isMockFunction(logger.info.raw)).toBe(false)
    expect(vi.isMockFunction(tagged1.info)).toBe(false)
    expect(vi.isMockFunction(tagged1.info.raw)).toBe(false)
    expect(vi.isMockFunction(tagged2.info)).toBe(false)
    expect(vi.isMockFunction(tagged2.info.raw)).toBe(false)
  })

  it('can check raw logging', () => {
    const mock = mockLogger()

    logger.info.raw('mock raw info log')
    const tagged = useLogger('t1')
    tagged.info.raw('mock raw info log by t1')

    expect(mock.info.raw).toHaveBeenNthCalledWith(2, 'mock raw info log by t1')
    expect(logger.info.raw).toHaveBeenCalledExactlyOnceWith('mock raw info log')
    expect(tagged.info.raw).toHaveBeenCalledExactlyOnceWith('mock raw info log by t1')
    expect(mock.getWithTag().info.raw).toHaveBeenCalledExactlyOnceWith('mock raw info log')
    expect(mock.getWithTag('t1').info.raw).toHaveBeenCalledExactlyOnceWith('mock raw info log by t1')

    vi.resetAllMocks()

    expect(mock.info.raw).not.toHaveBeenCalled()
    expect(mock.getSnapshot().info.raw).toHaveBeenNthCalledWith(2, 'mock raw info log by t1')
    expect(mock.getWithTag('t1').getSnapshot().info.raw).toHaveBeenCalledExactlyOnceWith('mock raw info log by t1')
  })

  it('does not call original logger by default', () => {
    mockLogger()

    const mockReporter = vi.fn<NuxtLogReporter['log']>()
    const tagged = useLogger('t1', {
      level: 5,
      reporters: [{ log: mockReporter }],
    })

    tagged.info('mock info log')
    tagged.info.raw('mock raw info log')

    expect(mockReporter).not.toHaveBeenCalled()
  })

  it('calls original logger when spy option is true', () => {
    mockLogger({ spy: true })

    const mockReporter = vi.fn<NuxtLogReporter['log']>()
    const tagged = useLogger('t1', {
      level: 5,
      reporters: [{ log: mockReporter }],
    })

    tagged.info({ message: 'mock info log' })
    expect(mockReporter).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ args: ['mock info log'] }),
      expect.anything(),
    )

    tagged.info.raw({ message: 'mock info log' })
    expect(mockReporter).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ args: [{ message: 'mock info log' }] }),
      expect.anything(),
    )
  })

  it('can check tagged logging via getWithTag', () => {
    const mock = mockLogger()
    const t1Mock = mock.getWithTag('t1')

    logger.info('mock info log')
    useLogger('t1').info('mock info log by t1')
    useLogger('t1').info('mock info log by t1')
    useLogger('t2').info('mock info log by t2')

    expect(mock.getWithTag().info).toHaveBeenCalledExactlyOnceWith('mock info log')
    expect(t1Mock.info).toHaveBeenNthCalledWith(2, 'mock info log by t1')
    expect(mock.getWithTag('t2').info).toHaveBeenCalledExactlyOnceWith('mock info log by t2')
  })

  it('can check logging after mockReset via getSnapshot', () => {
    const mock = mockLogger()

    logger.info('mock info log')
    useLogger('t1').info('mock info log')
    useLogger('t2').info('mock info log')

    vi.resetAllMocks()

    expect(mock.info).not.toHaveBeenCalled()
    expect(mock.getSnapshot().info).toHaveBeenNthCalledWith(3, 'mock info log')
  })

  it('can check tagged logging after mockReset via getWithTag + getSnapshot', () => {
    const mock = mockLogger()

    logger.info('mock info log')
    useLogger('t1').info('mock info log by t1')
    useLogger('t2').info('mock info log by t2')

    vi.resetAllMocks()

    expect(mock.info).not.toHaveBeenCalled()
    expect(mock.getWithTag().getSnapshot().info).toHaveBeenCalledExactlyOnceWith('mock info log')
    expect(mock.getWithTag('t1').getSnapshot().info).toHaveBeenCalledExactlyOnceWith('mock info log by t1')
    expect(mock.getWithTag('t2').getSnapshot().info).toHaveBeenCalledExactlyOnceWith('mock info log by t2')
  })

  it('can restore original loggers when mockLogger is called multiple times', () => {
    const context = useTestContextMock()
    mockLogger()
    mockLogger()

    context.teardown?.forEach(fn => fn())
    context.teardown = []

    const tagged = useLogger('t1')

    expect(vi.isMockFunction(logger.info)).toBe(false)
    expect(vi.isMockFunction(logger.info.raw)).toBe(false)
    expect(vi.isMockFunction(tagged.info)).toBe(false)
    expect(vi.isMockFunction(tagged.info.raw)).toBe(false)
  })

  it('can check custom log type logging', () => {
    const mock = mockLogger() as ReturnType<typeof mockLogger> & Record<'custom', typeof logger.info>

    const customLogger = useLogger('t1', {
      types: {
        custom: { level: 3 },
      } as never,
    }) as typeof logger & Record<'custom', typeof logger.info>

    customLogger.custom('mock custom log')
    customLogger.custom.raw('mock custom raw log')

    expect(mock.custom).toHaveBeenCalledExactlyOnceWith('mock custom log')
    expect(mock.custom.raw).toHaveBeenCalledExactlyOnceWith('mock custom raw log')
  })
})
