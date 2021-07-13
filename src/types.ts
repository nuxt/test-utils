import type { RequestListener } from 'http'
import type { NuxtConfig, NuxtOptions } from '@nuxt/types'
import type { Browser, LaunchOptions } from 'playwright'
import type { Listener } from 'listhen'

export interface NuxtTestOptions {
  rootDir: string
  configFile: string
  config: NuxtConfig

  randomBuildDir: boolean
  randomPort: boolean

  build: boolean
  generate: boolean

  server: boolean

  browser: boolean
  browserOptions: {
    type: 'chromium' | 'firefox' | 'webkit'
    launch?: LaunchOptions
  }

  setupTimeout: number
  waitFor: number
}

export interface Nuxt {
  server: {
    app: RequestListener,
  },
  options: NuxtOptions
  ready(): Promise<void>
  close(callback?: Function): Promise<void>
  resolver: any
  moduleContainer: any
  resolveAlias(path: string): string
  resolvePath(path: string, opts?: any): string
  renderRoute(...args: any[]): any
  renderAndGetWindow(url: string, opts?: any, config?: any): any
}

export interface NuxtTestContext {
  options: Partial<NuxtTestOptions>
  nuxt?: Nuxt
  builder?: {
    build(): Promise<any>
  }
  listener?: Listener
  browser?: Browser
}
