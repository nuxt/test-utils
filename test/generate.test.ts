import { readFileSync } from 'fs'
import { resolve } from 'path'
import { setupTest, getNuxt } from '../src'

describe('generate', () => {
  setupTest({
    testDir: __dirname,
    fixture: 'fixtures/generate',
    generate: true,
    config: {
      rootDir: resolve(__dirname, 'fixtures/generate')
    }
  })

  test('should generated page', () => {
    const html = readFileSync(resolve(getNuxt().options.generate.dir, 'index.html'), 'utf8')
    expect(html).toContain('Works!')
  })
})
