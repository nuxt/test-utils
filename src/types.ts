import { NuxtConfig } from '@nuxt/types'

export interface NuxtTestContext {
  __dirname: string
  fixture: string
  configFile: string

  rootDir: string
  config: NuxtConfig
  nuxt: {
    config: NuxtConfig
    listen: (port?: number) => any
    ready: () => any
    close: () => any
    moduleContainer: any
  }

  browser: boolean
  puppeteer: any // TIB

  build: boolean
  builder: {
    build: () => any
  }
  buildTimeout: number

  generate: boolean
  generateOptions: {
    build: boolean
    init: boolean
  }

  server: boolean
  url: string

  waitFor: number
}
