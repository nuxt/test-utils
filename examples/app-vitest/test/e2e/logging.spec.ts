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
          logger.log.raw('## build:before log.row() ##')
          logger.info('## build:before info() ##')
          logger.debug('## build:before debug() ##')
        },
        'build:done'() {
          nuxtLogger.log('## build:done log() ##')
          nuxtLogger.log.raw('## build:done log.raw() ##')
          nuxtLogger.info('## build:done info() ##')
          nuxtLogger.debug('## build:done debug() ##')
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
      const { log, info, debug } = logger.getSnapshot()

      expect(log).toHaveBeenCalledWith('## build:before log() ##')
      expect(log.raw).toHaveBeenCalledWith('## build:before log.row() ##')
      expect(info).toHaveBeenCalledWith('## build:before info() ##')
      expect(debug).toHaveBeenCalledWith('## build:before debug() ##')

      expect(log).toHaveBeenCalledWith('## build:done log() ##')
      expect(log.raw).toHaveBeenCalledWith('## build:done log.raw() ##')
      expect(info).toHaveBeenCalledWith('## build:done info() ##')
      expect(debug).toHaveBeenCalledWith('## build:done debug() ##')
    })

    it('can logging check withTag', () => {
      const { log, debug } = logger.getWithTag('tag').getSnapshot()
      expect(log).toHaveBeenCalledWith('## build:before log() ##')
      expect(log).not.toHaveBeenCalledWith('## build:done log() ##')

      expect(debug).toHaveBeenCalledWith('## build:before debug() ##')
      expect(debug).not.toHaveBeenCalledWith('## build:done debug() ##')
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
