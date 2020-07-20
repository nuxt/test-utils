import { NuxtConfig } from '@nuxt/types'

export interface NuxtTestContext {
  __dirname: string
  fixture: string

  rootDir: string
  config: NuxtConfig
  nuxt: {
    config: NuxtConfig
    listen: (port?) => any
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

  server: boolean
  url: string
}
