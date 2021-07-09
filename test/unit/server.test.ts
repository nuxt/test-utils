import { RequestListener } from 'http'
import { listen as listhen, Listener } from 'listhen'
import { listen } from '../../src/server'
import { getContext, NuxtTestContext, Nuxt } from '../../src/context'

const mockHandle = jest.fn() as RequestListener
const mockNuxt = { server: { app: mockHandle } } as Nuxt
const mockContext: Partial<NuxtTestContext> = {
  nuxt: mockNuxt
}

jest.mock('../../src/context', () => ({
  getContext: () => mockContext
}))

const mockListhen = listhen as jest.MockedFunction<typeof listhen>

jest.mock('listhen')

beforeEach(() => {
  jest.clearAllMocks()
  mockContext.options = {}
})

describe('server', () => {
  test('adds listener property to the context', async () => {
    const mockListener = {} as Listener
    mockListhen.mockResolvedValue(mockListener)

    const context = getContext()
    context.options = {
      config: { server: {} }
    }

    await listen()

    expect(context.listener).toBe(mockListener)
  })
})
