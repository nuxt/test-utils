import { randomId } from '../../src/utils'

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
