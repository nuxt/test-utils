import { readFileSync } from 'fs'
import { resolve } from 'path'
import { setupTest, NuxtTestContext } from '../src'

describe('generate', () => {
  const ctx: NuxtTestContext = setupTest({
    __dirname,
    fixture: 'fixtures/generate',
    generate: true,
    config: {
      rootDir: resolve(__dirname, 'fixtures/generate')
    }
  })

  test('should generated page', () => {
    const html = readFileSync(resolve(ctx.nuxt.options.generate.dir, 'index.html'), 'utf8')
    expect(html).toContain('Works!')
  })
})
