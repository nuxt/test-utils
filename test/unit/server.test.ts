import { RequestListener } from 'http'
import { listen as listhen, Listener } from 'listhen'
import { listen } from '../../src/server'
import { getContext } from '../../src/context'
import { NuxtTestContext, Nuxt } from '../../src/types'

const defaults = {
  config: { server: { port: 0 } }
}

const mockHandle = jest.fn() as RequestListener
const mockNuxt = { server: { app: mockHandle } } as Nuxt
const mockContext: Partial<NuxtTestContext> = {
  nuxt: mockNuxt
}

jest.mock('../../src/context', () => ({
  getContext: () => mockContext
}))

const mockListener = {} as Listener
const mockListhen = listhen as jest.MockedFunction<typeof listhen>
mockListhen.mockResolvedValue(mockListener)

jest.mock('listhen')

beforeEach(() => {
  jest.clearAllMocks()
  mockContext.options = {}
})

describe('server', () => {
  test('by default listens on random port', async () => {
    const port = { port: 0, random: true }
    const context = getContext()
    context.options = {
      ...defaults
    }

    await listen()

    expect(listhen).toBeCalledWith(mockHandle, { port })
  })

  test('listens on custom port', async () => {
    const port = { port: 5050, random: false }
    const context = getContext()
    context.options = {
      ...defaults,
      config: { server: { port: 5050 } }
    }

    await listen()

    expect(listhen).toBeCalledWith(mockHandle, { port })
  })

  test('adds listener property to the context', async () => {
    const context = getContext()
    context.options = {
      config: { server: {} }
    }

    await listen()

    expect(context.listener).toBe(mockListener)
  })
})
