import consola from 'consola'

export function mockConsola (): typeof consola {
  const mock = {}

  consola.mockTypes((type) => {
    mock[type] = mock[type] || jest.fn()
    return mock[type]
  })

  // @ts-ignore
  return mock
}
