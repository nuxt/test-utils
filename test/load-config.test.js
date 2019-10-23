const { loadConfig } = require('..')

describe('loadConfig', () => {
  test('override (replace)', () => {
    const override = {
      env: {
        ENV2: 'true'
      }
    }
    const config = loadConfig(__dirname, 'setup', override)
    expect(config.env).toEqual({ ENV2: 'true' })
  })

  test('override (merge)', () => {
    const override = {
      env: {
        ENV2: 'true'
      }
    }
    const config = loadConfig(__dirname, 'setup', override, { merge: true })
    expect(config.env).toEqual({ ENV1: 'true', ENV2: 'true' })
  })

  test('returns a copy of loaded config when not merging', () => {
    let config = loadConfig(__dirname, 'setup')
    config.render.injectScripts = true

    config = loadConfig(__dirname, 'setup')
    expect(config.render.injectScripts).toEqual(undefined)
  })

  test('returns a copy of loaded config when merging', () => {
    const override = { render: { injectScripts: true } }
    let config = loadConfig(__dirname, 'setup', override, { merge: true })

    config = loadConfig(__dirname, 'setup')
    expect(config.render.injectScripts).toEqual(undefined)
  })
})
