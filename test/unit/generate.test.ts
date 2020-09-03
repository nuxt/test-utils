import { readFileSync } from 'fs'
import { resolve } from 'path'
import { setupTest, getNuxt, expectModuleNotToBeCalledWith } from '../../src'

describe('generate', () => {
  setupTest({
    testDir: resolve(__dirname, '..'),
    fixture: 'fixtures/generate',
    generate: true,
    config: {
      rootDir: resolve(__dirname, '../fixtures/generate')
    }
  })

  test('should generated page', () => {
    const html = readFileSync(resolve(getNuxt().options.generate.dir, 'index.html'), 'utf8')
    expect(html).toContain('Works!')
  })

  test('module container call assertions negative', () => {
    expectModuleNotToBeCalledWith('addLayout', expect.stringContaining('layout.vue'))
    expectModuleNotToBeCalledWith('addLayout', expect.stringContaining('layout.vue'), 'name-layout')
    expectModuleNotToBeCalledWith('addErrorLayout', expect.stringContaining('error'))
    expectModuleNotToBeCalledWith('addServerMiddleware', expect.stringContaining('middleware.js'))
    expectModuleNotToBeCalledWith('requireModule', '~/modules/module-b')
    expectModuleNotToBeCalledWith('addPlugin', {
      src: expect.stringContaining('plugin.js'),
      fileName: 'plugin-a.js',
      options: {}
    })
  })
})
