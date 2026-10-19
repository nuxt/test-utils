import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'bun:test'
import { logger as nuxtLogger, useLogger } from 'nuxt/kit'
import { mockLogger, setup } from '@nuxt/test-utils/e2e'

function setupTest() {
  return setup({
    rootDir: fileURLToPath(new URL('../', import.meta.url)),
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

describe.serial('logging', () => {
  describe('can check logging by useLogger', async () => {
    await setupTest()

    const logger = mockLogger()

    it('logger is mocked', () => {
      expect(nuxtLogger.info).toHaveProperty('mock')
      expect(useLogger('tag').info).toHaveProperty('mock')
    })

    it('can logging check', () => {
      const { log, info } = logger
      expect(log).toHaveBeenCalledWith('## build:before log() ##')
      expect(info).toHaveBeenCalledWith('## build:before info() ##')
      expect(log).toHaveBeenCalledWith('## build:done log() ##')
      expect(info).toHaveBeenCalledWith('## build:done info() ##')
    })

    it('can clear mock', () => {
      const { log, info } = logger
      expect(log).toHaveBeenCalled()
      expect(info).toHaveBeenCalled()

      vi.clearAllMocks()

      expect(log).not.toHaveBeenCalled()
      expect(info).not.toHaveBeenCalled()
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
