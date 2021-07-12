import { readdir } from 'fs/promises'
import { ensureNuxtApp, randomId } from '../../src/utils'

const mockReaddir = readdir as jest.MockedFunction<typeof readdir>

jest.mock('fs/promises')

describe('isNuxtAppDir', () => {
  test('stays silent if nuxt app is discovered', async () => {
    mockReaddir.mockReset().mockResolvedValue('pages' as jest.ResolvedValue<String>)
    await expect(ensureNuxtApp('.')).resolves.not.toThrow()
  })

  test('throws if nuxt app is NOT found', async () => {
    mockReaddir.mockReset().mockResolvedValue([])
    await expect(ensureNuxtApp('.')).rejects.toThrow('Cannot find')
  })

  test('throws if directory is unreachable', async () => {
    mockReaddir.mockReset().mockRejectedValue(new Error('Mock error'))
    await expect(ensureNuxtApp('.')).rejects.toThrow('Cannot read')
  })
})

describe('randomId', () => {
  test('generates 1,000,000 unique IDs', () => {
    const ids = new Set<string>()
    const count = 10 ** 6
    for (let i = 0; i < count; ++i) {
      ids.add(randomId())
    }

    expect(ids.size).toEqual(count)
  })
})
