import { fileURLToPath } from 'node:url'
import { resolve } from 'pathe'
import { glob } from 'tinyglobby'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  nuxtConfig: {
    nitro: {
      prerender: {
        routes: ['/test'],
      },
    },
  },
})

describe('generate test', () => {
  it('can assert files are prerendered', async () => {
    const ctx = useTestContext()
    const outputDir = resolve(ctx.nuxt!.options.nitro.output?.dir || '', 'public')
    const files = await glob('**/*.html', { cwd: outputDir })
    expect(files).toContain('test/index.html')
  })
})
