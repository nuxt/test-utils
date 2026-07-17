import { fileURLToPath } from 'node:url'
import { $fetch, clearServerLogs, getServerLogs, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it, vi } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
})

describe('server log capture', () => {
  it('captures console.log output from a server route', async () => {
    clearServerLogs()
    await $fetch('/api/log-test')
    await vi.waitFor(() => {
      expect(getServerLogs().some(line => line.includes('[test] server-log-marker'))).toBe(true)
    })
  })

  it('clearServerLogs empties the buffer', async () => {
    await $fetch('/api/log-test')
    await vi.waitFor(() => {
      expect(getServerLogs().length).toBeGreaterThan(0)
    })
    clearServerLogs()
    expect(getServerLogs()).toHaveLength(0)
  })
})
