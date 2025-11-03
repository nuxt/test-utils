import type { App } from 'h3'
import type { $Fetch } from 'nitropack'
import type { EnvironmentOptions } from 'vitest/node'

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
  jsdom?: EnvironmentOptions['jsdom']
  happyDom?: EnvironmentOptions['happyDOM']
}
export type EnvironmentNuxt = (global: typeof globalThis, options: EnvironmentNuxtOptions) => Promise<{
  window: NuxtWindow
  teardown (): void
}>
