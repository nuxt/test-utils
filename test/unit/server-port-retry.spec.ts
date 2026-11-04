import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it, vi } from 'vitest'
import { getRandomPort } from 'get-port-please'

import { createTestContext, setTestContext } from '../../src/e2e/context.ts'
import { startServer, stopServer } from '../../src/e2e/server.ts'

vi.mock('get-port-please', async (importOriginal) => {
  const mod = await importOriginal<typeof import('get-port-please')>()
  return { ...mod, getRandomPort: vi.fn(mod.getRandomPort) }
})

const serverScript = `
import { createServer } from 'node:http'

const port = Number(process.env.PORT)
const host = process.env.HOST || '127.0.0.1'

const server = createServer((_req, res) => {
  res.end('ok')
})
server.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
server.listen(port, host, () => {
  console.log('test server listening')
})
`

function listen(host: string) {
  return new Promise<{ server: ReturnType<typeof createServer>, port: number }>((resolve) => {
    const server = createServer((socket) => {
      socket.destroy()
    })
    server.listen(0, host, () => {
      const { port } = server.address() as AddressInfo
      resolve({ server, port })
    })
  })
}

describe('startServer port retries', () => {
  it('retries with a fresh port when the picked port is taken', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'nuxt-test-utils-port-retry-'))
    await mkdir(join(outputDir, 'server'))
    await writeFile(join(outputDir, 'server', 'index.mjs'), serverScript)

    const { server: holder, port: heldPort } = await listen('127.0.0.1')
    vi.mocked(getRandomPort).mockResolvedValueOnce(heldPort)

    const ctx = createTestContext({ nuxtConfig: { nitro: { output: { dir: outputDir } } } })

    try {
      await startServer()
      expect(ctx.url).not.toBe(`http://127.0.0.1:${heldPort}/`)
      expect(getRandomPort).toHaveBeenCalledTimes(2)
      expect((await fetch(ctx.url!)).status).toBe(200)
    }
    finally {
      await stopServer()
      holder.close()
      setTestContext(undefined)
      await rm(outputDir, { recursive: true, force: true })
    }
  }, 30_000)

  it('does not retry away from an explicitly configured port', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'nuxt-test-utils-port-retry-'))
    await mkdir(join(outputDir, 'server'))
    await writeFile(join(outputDir, 'server', 'index.mjs'), serverScript)

    const { server: holder, port: heldPort } = await listen('127.0.0.1')

    createTestContext({ port: heldPort, nuxtConfig: { nitro: { output: { dir: outputDir } } } })

    try {
      await expect(startServer()).rejects.toThrow(/EADDRINUSE|address already in use/)
      expect(getRandomPort).not.toHaveBeenCalled()
    }
    finally {
      holder.close()
      setTestContext(undefined)
      await rm(outputDir, { recursive: true, force: true })
    }
  }, 30_000)
})
