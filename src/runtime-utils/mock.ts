/* eslint-disable @typescript-eslint/no-empty-object-type */
import { defineEventHandler } from 'h3'
import type { App, EventHandler, HTTPMethod } from 'h3'
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

type Awaitable<T> = T | Promise<T>
type OptionalFunction<T> = T | (() => Awaitable<T>)

const endpointRegistry: Record<string, Array<{ handler: EventHandler, method?: HTTPMethod, once?: boolean }>> = {}
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
export function registerEndpoint(url: string, options: EventHandler | { handler: EventHandler, method?: HTTPMethod, once?: boolean }) {
  // @ts-expect-error private property
  const app: App = window.__app

  if (!app) {
    throw new Error('registerEndpoint() can only be used in a `@nuxt/test-utils` runtime environment')
  }

  const config = typeof options === 'function' ? { handler: options, method: undefined, once: false } : options
  config.handler = defineEventHandler(config.handler)

  // @ts-expect-error private property
  const hasBeenRegistered: boolean = window.__registry.has(url)

  endpointRegistry[url] ||= []
  endpointRegistry[url].push(config)

  if (!hasBeenRegistered) {
    // @ts-expect-error private property
    window.__registry.add(url)

    app.use('/_' + url, defineEventHandler(async (event) => {
      const latestHandler = [...endpointRegistry[url] || []].reverse().find(config => config.method ? event.method === config.method : true)
      if (!latestHandler) return

      const result = await latestHandler.handler(event)

      if (!latestHandler.once) return result

      const index = endpointRegistry[url]?.indexOf(latestHandler)
      if (index === undefined || index === -1) return result

      endpointRegistry[url]?.splice(index, 1)
      if (endpointRegistry[url]?.length === 0) {
        // @ts-expect-error private property
        window.__registry.delete(url)
      }

      return result
    }), {
      match(_, event) {
        return endpointRegistry[url]?.some(config => config.method ? event?.method === config.method : true) ?? false
      },
    })
  }

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
 * @param _name - name of an import to mock.
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
 * ```
 * @see https://nuxt.com/docs/getting-started/testing#mocknuxtimport
 */
export function mockNuxtImport<T = unknown>(
  _name: string,
  _factory: () => T | Promise<T>,
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
  >
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
  >
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
  >
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
  >
): void
export function mockComponent(_path: string, _component: unknown): void {
  throw new Error(
    'mockComponent() is a macro and it did not get transpiled. This may be an internal bug of @nuxt/test-utils.',
  )
}
