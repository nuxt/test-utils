import mock from 'consola'

export function mockConsola () {
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
