import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { logger as nuxtLogger, useLogger } from 'nuxt/kit'
import { mockLogger, setup } from '@nuxt/test-utils/e2e'

function setupTest() {
  return setup({
    rootDir: fileURLToPath(new URL('../../', import.meta.url)),
    nuxtConfig: {
      hooks: {
        'build:before'() {
          const logger = useLogger('tag')
          logger.log('## build:before log() ##')
          logger.info('## build:before info() ##')
        },
        'build:done'() {
          nuxtLogger.log('## build:done log() ##')
          nuxtLogger.info('## build:done info() ##')
        },
      },
    },
  })
}

describe('logging', { concurrent: false }, () => {
  describe('can check logging by useLogger', async () => {
    await setupTest()

    const logger = mockLogger()

    it('logger is mocked', () => {
      expect(nuxtLogger.info).toHaveProperty('mock')
      expect(useLogger('tag').info).toHaveProperty('mock')
    })

    it('can logging check', () => {
      // Since Vitest's clearMocks is true by default, check via getSnapshot()
      const { log, info } = logger.getSnapshot()
      expect(log).toHaveBeenCalledWith('## build:before log() ##')
      expect(info).toHaveBeenCalledWith('## build:before info() ##')
      expect(log).toHaveBeenCalledWith('## build:done log() ##')
      expect(info).toHaveBeenCalledWith('## build:done info() ##')
    })
  })

  describe('should restore mock logger previous test teardown', async () => {
    await setupTest()

    it('logger is not mocked', () => {
      expect(nuxtLogger.info).not.toHaveProperty('mock')
      expect(useLogger('tag').info).not.toHaveProperty('mock')
    })
  })
})
