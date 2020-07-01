import { Configuration } from '@nuxt/types'
import { RequestPromiseOptions } from 'request-promise-native'

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

export type GetRequest<T = any> = (path: string, options?: RequestPromiseOptions) => Promise<T>
export const get: GetRequest

export const url: (path?: string) => string
