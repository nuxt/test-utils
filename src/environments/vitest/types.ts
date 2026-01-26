import type { H3Event as H3V1Event } from 'h3'
import type { H3Event as H3V2Event } from 'h3-next'
import type { $Fetch } from 'nitropack'
import type { EnvironmentOptions } from 'vitest/node'

export type NuxtBuiltinEnvironment = 'happy-dom' | 'jsdom'
interface GenericAppUse {
  (route: string, handler: (event: H3V2Event | H3V1Event) => unknown, options?: { match: (...args: [string, H3V1Event | undefined] | [H3V2Event]) => boolean }): void
  (handler: (event: H3V2Event | H3V1Event) => unknown, options?: { match: (...args: [string, H3V1Event | undefined] | [H3V2Event]) => boolean }): void
}
export interface GenericApp {
  use: GenericAppUse
}
export interface NuxtWindow extends Window {
  __app?: GenericApp
  __registry: Set<string>
  __NUXT_VITEST_ENVIRONMENT__?: boolean
  __NUXT__: Record<string, unknown>
  $fetch: $Fetch
  fetch: ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>)
  IntersectionObserver: unknown
  Headers: typeof Headers
}
export interface EnvironmentNuxtOptions {
  jsdom?: EnvironmentOptions['jsdom']
  happyDom?: EnvironmentOptions['happyDOM']
}
export type EnvironmentNuxt = (global: typeof globalThis, options: EnvironmentNuxtOptions) => Promise<{
  window: NuxtWindow
  teardown (): void
}>
