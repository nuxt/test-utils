import type { App } from 'h3'
import type { $Fetch } from 'nitropack'
import type { JSDOMOptions, HappyDOMOptions } from 'vitest'

export type NuxtBuiltinEnvironment = 'happy-dom' | 'jsdom'
export interface NuxtWindow extends Window {
  __app: App
  __registry: Set<string>
  __NUXT_VITEST_ENVIRONMENT__?: boolean
  __NUXT__: Record<string, unknown>
  $fetch: $Fetch
  fetch: ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>)
  IntersectionObserver: unknown
  Headers: typeof Headers
}
export interface EnvironmentNuxtOptions {
  jsdom?: JSDOMOptions
  happyDom?: HappyDOMOptions
}
export type EnvironmentNuxt = (global: typeof globalThis, options: EnvironmentNuxtOptions) => Promise<{
  window: NuxtWindow
  teardown (): void
}>
