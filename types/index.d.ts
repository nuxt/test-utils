import { Configuration } from '@nuxt/types'
import { Options } from 'request-promise'

export type BeforeNuxtReadyFn = (nuxt: any /*TBD*/) => Promise<void>

export const init: (
  config: Configuration,
  options?: { beforeNuxtReady?: BeforeNuxtReadyFn }
) => Promise<any /*TBD*/>

export const build: (
  config: Configuration,
  options?: {
    waitFor?: number
    beforeNuxtReady?: BeforeNuxtReadyFn
  }
) => Promise<{ nuxt: any /*TBD*/; builder: any /*TBD*/ }>

export const generate: (
  config: Configuration,
  options?: { build?: boolean; init?: boolean },
  initOptions?: { beforeNuxtReady?: BeforeNuxtReadyFn }
) => Promise<{
  nuxt: any /*TBD*/
  builder: any /*TBD*/
  generator: any /*TBD*/
}>

export const loadConfig: (
  dir: string,
  fixture?: string,
  override?: Configuration,
  options?: { merge?: boolean }
) => Configuration

export const setup: (
  config: Configuration,
  options?: {
    port?: number
    waitFor?: number
    beforeNuxtReady?: BeforeNuxtReadyFn
  }
) => Promise<{ nuxt: any /*TBD*/; builder: any /*TBD*/ }>

export const generatePort: (port?: number) => Promise<number>

export const get: (path: string, options?: Options) => Promise<any>

export const url: (path?: string) => string
