import { consola } from 'consola'
import { createTest, exposeContextToEnv } from '@nuxt/test-utils/e2e'

const options = JSON.parse(process.env.NUXT_TEST_OPTIONS || '{}')
const hooks = createTest(options)

export const setup = async () => {
  consola.info('Building Nuxt app...')
  await hooks.beforeAll()
  exposeContextToEnv()
  consola.info('Running tests...')
}

export const teardown = async () => {
  await hooks.afterAll()
}
