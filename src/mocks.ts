import consola from 'consola'

export function mockConsola () {
  const mock = consola

  beforeAll(() => {
    mock.wrapAll()
  })

  mock.mockTypes(() => jest.fn())

  jest.mock('consola', () => ({
    ...mock,
    withTag: jest.fn().mockImplementation(() => mock),
    withScope: jest.fn().mockImplementation(() => mock)
  }))

  return mock
}
