const { init, loadConfig } = require('..')

describe('init', () => {
  test('simple', async () => {
    const nuxt = await init(loadConfig(__dirname))
    expect(nuxt._initCalled).toBe(true)
  })

  test('use beforeNuxtReady', async () => {
    let beforeReady = false
    await init(loadConfig(__dirname), { beforeNuxtReady: () => { beforeReady = true } })
    expect(beforeReady).toBe(true)
  })
})
