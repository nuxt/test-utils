import NodeEnvironment from 'jest-environment-node'
import type { EnvironmentContext } from '@jest/environment'
import type { Config } from '@jest/types'
import { name } from '../package.json'
import { createContext, getContext, NuxtTestOptions } from './context'
import { setupNuxtTest, teardownNuxtTest } from './setup'

type NuxtTestEnvironment = Config.ProjectConfig & NuxtTestOptions

export class NuxtEnvironment extends NodeEnvironment {
  options: Partial<NuxtTestOptions>

  readonly pragmas: any
  readonly features: string[]

  constructor (config: NuxtTestEnvironment, context: EnvironmentContext) {
    super(config)
    this.options = config[name] || {}
    this.pragmas = context.docblockPragmas
    this.features = this.pragmas.features ? this.pragmas.features.split(' ') : []
  }

  parseFeatures () {
    if (this.features.includes('build')) {
      this.options.build = true
    }

    if (this.features.includes('server')) {
      this.options.server = true
    }

    if (this.features.includes('generate')) {
      this.options.generate = true
    }

    if (this.features.includes('browser')) {
      this.options.browser = true
    }

    if (this.features.includes('debug')) {
      this.options.browserOptions = {
        type: this.options?.browserOptions?.type || 'chromium',
        launch: {
          devtools: true,
          slowMo: 1000
        }
      }
    }
  }

  parseOptions () {
    if (this.pragmas.testDir) {
      this.options.testDir = this.pragmas.testDir
    }

    if (this.pragmas.fixture) {
      this.options.fixture = this.pragmas.fixture
    }

    if (this.pragmas.configFile) {
      this.options.configFile = this.pragmas.configFile
    }

    if (this.pragmas.rootDir) {
      this.options.rootDir = this.pragmas.rootDir
    }

    if (this.pragmas.waitFor) {
      this.options.waitFor = Number(this.pragmas.waitFor)
    }
  }

  async setup () {
    await super.setup()

    this.parseFeatures()
    this.parseOptions()

    await setupNuxtTest(createContext(this.options), false)

    this.global.$nuxtTestContext = getContext()
  }

  async teardown () {
    await teardownNuxtTest()

    this.global.$nuxtTestContext = undefined

    await super.teardown()
  }
}
