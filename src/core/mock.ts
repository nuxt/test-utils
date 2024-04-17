import { consola } from 'consola'
import type { LogType } from 'consola'
import { useTestContext } from './context'

export function mockFn() {
  const ctx = useTestContext()
  return ctx.mockFn
}

export function mockLogger(): Record<LogType, (...args: unknown[]) => void> {
  const mocks: Partial<Record<LogType, (...args: unknown[]) => void>> = {}
  consola.mockTypes((type) => {
    mocks[type] = mockFn()
    return mocks[type]!
  })
  return mocks as Record<LogType, (...args: unknown[]) => void>
}
