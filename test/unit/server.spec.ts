import { describe, expect, it } from 'vitest'
import { createTestContext, setTestContext } from '../../src/e2e/context.ts'
import { startServer } from '../../src/e2e/server.ts'

describe('startServer', () => {
  it('should refuse to start a server for a disposed context', async () => {
    const ctx = createTestContext({ dev: false, build: false, browser: false })
    ctx.disposed = true

    try {
      await expect(startServer()).rejects.toThrow(/torn down/)
    }
    finally {
      setTestContext(undefined)
    }
  })
})
