import { readFileSync } from 'fs'
import { resolve } from 'path'
import { setupTest, getNuxt, expectModuleNotToBeCalledWith, expectFileToBeGenerated, expectFileNotToBeGenerated } from '../../src'

describe('generate', () => {
  setupTest({
    rootDir: 'test/fixtures/generate',
    generate: true
  })

  test('should not file generated', () => {
    expectFileNotToBeGenerated('foo.html')
  })

  test('should file generated', () => {
    expectFileToBeGenerated('index.html')
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
