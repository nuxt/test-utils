import { fileURLToPath } from 'node:url'
import { createTest, setTestContext } from '@nuxt/test-utils/e2e'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('../../', import.meta.url))
const servers = [createTest({ rootDir, dev: true }), createTest({ rootDir, dev: true })]

for (const server of servers) {
  beforeAll(async () => {
    setTestContext(server.ctx)
    await server.beforeAll()
  }, server.ctx.options.setupTimeout)
  afterAll(server.afterAll, server.ctx.options.teardownTimeout)
}

describe('concurrent dev servers', () => {
  it('runs two dev servers for the same fixture', async () => {
    const [first, second] = servers.map(server => server.ctx)
    expect(first!.nuxt!.options.buildDir).not.toBe(second!.nuxt!.options.buildDir)
    for (const ctx of [first!, second!]) {
      const html = await fetch(ctx.url!).then(res => res.text())
      expect(html).toContain('My title')
    }
  })
})
