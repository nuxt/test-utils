import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { beforeAll, beforeEach, describe, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
})

describe('console', async () => {
  beforeAll(() => {
    console.log('=== beforeAll info ===')
    console.error('=== beforeAll error ===')
  })

  beforeEach(() => {
    console.log('=== beforeEach info ===')
    console.error('=== beforeEach error ===')
  })

  it('test1', () => {
    console.log('=== test1 info ===')
    console.error('=== test1 error ===')
  })
})
