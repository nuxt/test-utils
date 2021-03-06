import { setupTest, mockConsola } from '../../src'

describe('consola', () => {
  const consola = mockConsola()

  setupTest({
    fixture: 'fixtures/consola'
  })

  test('should warn with global consola', () => {
    expect(consola.warn).toHaveBeenCalledWith('foo')
  })

  test('should error with tagged consola', () => {
    expect(consola.error).toHaveBeenCalledWith('bar')
  })
})
