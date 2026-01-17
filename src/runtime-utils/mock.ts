/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { EventHandler as H3V1EventHandler, H3Event as H3V1Event } from 'h3'
import type { EventHandler as H3V2EventHandler, H3Event as H3V2Event, HTTPMethod } from 'h3-next'
import type {
  ComponentInjectOptions,
  ComponentOptionsMixin,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithoutProps,
  ComponentPropsOptions,
  ComputedOptions,
  EmitsOptions,
  MethodOptions,
  RenderFunction,
  SetupContext,
} from 'vue'
import type { GenericApp } from '../vitest-environment'

type Awaitable<T> = T | Promise<T>
type OptionalFunction<T> = T | (() => Awaitable<T>)

type Handler = H3V1EventHandler | H3V2EventHandler
type EndpointRegistry = Record<string, Array<{ handler: Handler, method?: HTTPMethod, once?: boolean }>>

function getEndpointRegistry(): EndpointRegistry {
  // @ts-expect-error private property
  const app = window.__app ?? {}
  return (app._registeredEndpointRegistry ||= {})
}
/**
 * `registerEndpoint` allows you create Nitro endpoint that returns mocked data. It can come in handy if you want to test a component that makes requests to API to display some data.
 * @param url - endpoint name (e.g. `/test/`).
 * @param options - factory function that returns the mocked data or an object containing the `handler`, `method`, and `once` properties.
 * - `handler`: the event handler function
 * - `method`: (optional) HTTP method to match (e.g., 'GET', 'POST')
 * - `once`: (optional) if true, the handler will only be used for the first matching request and then automatically removed
 * @example
 * ```ts
 * import { registerEndpoint } from '@nuxt/test-utils/runtime'
 *
 * registerEndpoint("/test/", () => ({
 *  test: "test-field"
 * }))
 *
 * // With once option
 * registerEndpoint("/api/user", {
 *   handler: () => ({ name: "Alice" }),
 *   once: true
 * })
 * ```
 * @see https://nuxt.com/docs/getting-started/testing#registerendpoint
 */
export function registerEndpoint(url: string, options: H3V1EventHandler | { handler: H3V1EventHandler, method?: HTTPMethod, once?: boolean }) {
  // @ts-expect-error private property
  const app: GenericApp = window.__app

  if (!app) {
    throw new Error('registerEndpoint() can only be used in a `@nuxt/test-utils` runtime environment')
  }

  const config = typeof options === 'function' ? { handler: options, method: undefined, once: false } : options
  config.handler = Object.assign(config.handler, { __is_handler__: true as const })

  const endpointRegistry = getEndpointRegistry()

  endpointRegistry[url] ||= []
  endpointRegistry[url].push(config)

  // @ts-expect-error private property
  window.__registry.add(url)

  // @ts-expect-error private property
  app._registered
    ||= registerGlobalHandler(app)

  return () => {
    endpointRegistry[url]?.splice(endpointRegistry[url].indexOf(config), 1)
    if (endpointRegistry[url]?.length === 0) {
      // @ts-expect-error private property
      window.__registry.delete(url)
    }
  }
}

/**
 * `mockNuxtImport` allows you to mock Nuxt's auto import functionality.
 * @param _target - name of an import to mock or mocked target.
 * @param _factory - factory function that returns mocked import.
 * @example
 * ```ts
 * import { mockNuxtImport } from '@nuxt/test-utils/runtime'
 *
 * mockNuxtImport('useStorage', () => {
 *  return () => {
 *    return { value: 'mocked storage' }
 *  }
 * })
 *
 * // With mocked target
 * mockNuxtImport(useStorage, () => {
 *  return () => {
 *    return { value: 'mocked storage' }
 *  }
 * })
 * ```
 * @see https://nuxt.com/docs/getting-started/testing#mocknuxtimport
 */
export function mockNuxtImport<T = unknown>(
  _target: string | T,
  _factory: (original: T) => T | Promise<T>,
): void {
  throw new Error(
    'mockNuxtImport() is a macro and it did not get transpiled. This may be an internal bug of @nuxt/test-utils.',
  )
}

/**
 * `mockComponent` allows you to mock Nuxt's component.
 * @param path - component name in PascalCase, or the relative path of the component.
 * @param setup - factory function that returns the mocked component.
 * @example
 * ```ts
 * import { mockComponent } from '@nuxt/test-utils/runtime'
 *
 * mockComponent('MyComponent', {
 *  props: {
 *    value: String
 *  },
 *  setup(props) {
 *    // ...
 *  }
 * })
 *
 * // relative path or alias also works
 * mockComponent('~/components/my-component.vue', async () => {
 *  // or a factory function
 *  return {
 *    setup(props) {
 *      // ...
 *    }
 *  }
 * })
 *
 * // or you can use SFC for redirecting to a mock component
 * mockComponent('MyComponent', () => import('./MockComponent.vue'))
 * ```
 * @see https://nuxt.com/docs/getting-started/testing#mockcomponent
 */
export function mockComponent<Props, RawBindings = object>(
  path: string,
  setup: OptionalFunction<
    (props: Readonly<Props>, ctx: SetupContext) => RawBindings | RenderFunction
  >,
): void
export function mockComponent<
  Props = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
>(
  path: string,
  options: OptionalFunction<
    ComponentOptionsWithoutProps<
      Props,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      EE,
      I,
      II
    >
  >,
): void
export function mockComponent<
  PropNames extends string,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
>(
  path: string,
  options: OptionalFunction<
    ComponentOptionsWithArrayProps<
      PropNames,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      EE,
      I,
      II
    >
  >,
): void
export function mockComponent<
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
>(
  path: string,
  options: OptionalFunction<
    ComponentOptionsWithObjectProps<
      PropsOptions,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      EE,
      I,
      II
    >
  >,
): void
export function mockComponent(_path: string, _component: unknown): void {
  throw new Error(
    'mockComponent() is a macro and it did not get transpiled. This may be an internal bug of @nuxt/test-utils.',
  )
}

const handler = Object.assign(async (event: H3V1Event | H3V2Event) => {
  const endpointRegistry = getEndpointRegistry()
  const url = 'url' in event && event.url
    ? event.url.pathname.replace(/^\/_/, '')
    : event.path.replace(/[?#].*$/, '').replace(/^\/_/, '')
  const latestHandler = [...endpointRegistry[url] || []].reverse().find(config => config.method ? event.method === config.method : true)
  if (!latestHandler) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await latestHandler.handler(event as any)

  if (!latestHandler.once) return result

  const index = endpointRegistry[url]?.indexOf(latestHandler)
  if (index === undefined || index === -1) return result

  endpointRegistry[url]?.splice(index, 1)
  if (endpointRegistry[url]?.length === 0) {
    // @ts-expect-error private property
    window.__registry.delete(url)
  }

  return result
}, { __is_handler__: true as const })

function registerGlobalHandler(app: GenericApp) {
  app.use(handler, {
    match: (...args) => {
      const [eventOrPath, _event = eventOrPath] = args
      const endpointRegistry = getEndpointRegistry()
      const url = typeof eventOrPath === 'string'
        ? eventOrPath.replace(/^\/_/, '').replace(/[?#].*$/, '')
        : eventOrPath.url.pathname.replace(/^\/_/, '')
      const event = _event as H3V1Event | H3V2Event | undefined
      return endpointRegistry[url]?.some(config => config.method ? event?.method === config.method : true) ?? false
    },
  })

  return true
}
