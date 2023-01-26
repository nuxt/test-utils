import { defineEventHandler } from 'h3'
import type { EventHandler } from 'h3'
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

export type Awaitable<T> = T | Promise<T>
export type OptionalFunction<T> = T | (() => Awaitable<T>)

export function registerEndpoint(url: string, handler: EventHandler) {
  // @ts-expect-error private property
  if (!window.__app) return
  // @ts-expect-error private property
  window.__app.use('/_' + url, defineEventHandler(handler))
  // @ts-expect-error private property
  window.__registry.add(url)
}

export function mockNuxtImport<T = any>(
  _name: string,
  _factory: () => T | Promise<T>
): void {
  throw new Error(
    'mockNuxtImport() is a macro and it did not get transpiled, this may be an internal bug of nuxt-vitest.'
  )
}

/**
 * Mock a component, the first argument can be the relative path to the component, or the component name in PascalCase.
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
  II extends string = string
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
  II extends string = string
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
  II extends string = string
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
export function mockComponent(_path: string, _component: any): void {
  throw new Error(
    'mockComponent() is a macro and it did not get transpiled, this may be an internal bug of nuxt-vitest.'
  )
}
