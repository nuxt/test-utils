import { loadFixture } from '../../src'
import { createContext } from '../../src/context'
import basicFixtureConfig from '../fixtures/basic/nuxt.config'
import functionFixtureConfig from '../fixtures/function/nuxt.config'

describe('context', () => {
  test('loads object fixture config', async () => {
    const context = createContext({ fixture: './fixtures/basic' })
    await loadFixture()
    expect(context.options.config).toMatchObject(basicFixtureConfig)
  })

  test('loads function fixture config', async () => {
    const context = createContext({ fixture: './fixtures/function' })
    await loadFixture()
    expect(context.options.config).toMatchObject(functionFixtureConfig())
  })

  test('loads async function fixture config', async () => {
    const context = createContext({ fixture: './fixtures/function', configFile: 'nuxt.config.async.js' })
    await loadFixture()
    expect(context.options.config).toMatchObject(functionFixtureConfig())
  })

  test('throws error on async function fixture config with error', async () => {
    createContext({ fixture: './fixtures/function', configFile: 'nuxt.config.async.error.js' })
    await expect(loadFixture()).rejects.toThrow('Error while fetching async configuration')
  })
})
