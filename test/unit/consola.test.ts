import { setupTest, mockConsola } from '../../src'

describe('consola', () => {
  const consola = mockConsola()

  setupTest({
    build: true,
    fixture: 'fixtures/consola'
  })

  test('should warn', () => {
    expect(consola.warn).toHaveBeenCalledWith('foo')
  })
})

describe('consola with tag', () => {
  const consolaWithTag = mockConsola()

  setupTest({
    build: true,
    fixture: 'fixtures/consola-with-tag'
  })

  test('should warn', () => {
    expect(consolaWithTag.error).toHaveBeenCalledWith('bar')
  })
})
