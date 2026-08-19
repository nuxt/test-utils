import { describe, expect, it } from 'vitest'

import { createTestContext, setTestContext } from '../../src/e2e/context.ts'
import { startServer } from '../../src/e2e/server.ts'

function createContext(options: { captureServerLogs?: boolean } = {}) {
  const ctx = createTestContext({
    ...options,
    serverStartTimeout: 20_000,
    nuxtConfig: {
      nitro: { output: { dir: '/nonexistent-nuxt-test-utils-output' } },
    },
  })
  return ctx
}

describe('early server exit', () => {
  it('should report the exit code and the captured output', async () => {
    createContext()
    try {
      await expect(startServer()).rejects.toThrow(/Server process exited before becoming ready \(exit code: 1, killed: false, after \d+ms, mode: built\)\n--- last output from the server process ---\n[\s\S]*nonexistent-nuxt-test-utils-output/)
    }
    finally {
      setTestContext(undefined)
    }
  }, 30_000)

  it('should say why no output is available when capturing is disabled', async () => {
    createContext({ captureServerLogs: false })
    try {
      await expect(startServer()).rejects.toThrow(/\(no output captured: `captureServerLogs` is disabled\)/)
    }
    finally {
      setTestContext(undefined)
    }
  }, 30_000)
})
