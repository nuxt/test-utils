import { mount } from '@vue/test-utils'
import type { ComponentMountingOptions } from '@vue/test-utils'
import { Suspense, h, isReadonly, nextTick, reactive, unref, getCurrentInstance, effectScope, isRef } from 'vue'
import type { App, ComponentInternalInstance, DefineComponent, SetupContext } from 'vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

import NuxtRoot from '#build/root-component.mjs'
import { tryUseNuxtApp, useRouter } from '#imports'

type MountSuspendedOptions<T> = ComponentMountingOptions<T> & {
  route?: RouteLocationRaw
  scoped?: boolean
}

// TODO: improve return types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetupState = Record<string, any>
type Emit = ComponentInternalInstance['emit']

/**
 * `mountSuspended` allows you to mount any vue component within the Nuxt environment, allowing async setup and access to injections from your Nuxt plugins. For example:
 *
 * ```ts
 * // tests/components/SomeComponents.nuxt.spec.ts
 * it('can mount some component', async () => {
 * const component = await mountSuspended(SomeComponent)
 * expect(component.text()).toMatchInlineSnapshot(
 * 'This is an auto-imported component'
 * )
 * })
 *
 * // tests/App.nuxt.spec.ts
 * it('can also mount an app', async () => {
 * const component = await mountSuspended(App, { route: '/test' })
 * expect(component.html()).toMatchInlineSnapshot(`
 * "<div>This is an auto-imported component</div>
 * <div> I am a global component </div>
 * <div>/</div>
 * <a href=\\"/test\\"> Test link </a>"
 * `)
 * })
 * ```
 * @param component the component to be tested
 * @param options optional options to set up your component
 */
export async function mountSuspended<T>(
  component: T,
  options?: MountSuspendedOptions<T>,
): Promise<ReturnType<typeof mount<T>> & { setupState: SetupState }> {
  const {
    props = {},
    attrs = {},
    slots = {} as ComponentMountingOptions<T>['slots'],
    route = '/',
    ..._options
  } = options || {}

  // cleanup previously mounted test wrappers
  for (const cleanupFunction of globalThis.__cleanup || []) {
    cleanupFunction()
  }

  const vueApp: App<Element> & Record<string, unknown> = tryUseNuxtApp()?.vueApp
    // @ts-expect-error untyped global __unctx__
    || globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const { render, setup, data, computed, methods, ...componentRest } = component as DefineComponent<Record<string, unknown>, Record<string, unknown>>

  let setupContext: SetupContext
  let setupState: Record<string, unknown>
  const setProps = reactive<Record<string, unknown>>({})

  let interceptedEmit: Emit | null = null
  /**
   * Intercept the emit for testing purposes.
   *
   * @remarks
   * Using this function ensures that the emit is not intercepted multiple times
   * and doesn't duplicate events.
   *
   * @param emit - The original emit from the component's context.
   *
   * @returns An intercepted emit that will both emit from the component itself
   * and from the top level wrapper for assertions via
   * {@link import('@vue/test-utils').VueWrapper.emitted()}.
   */
  function getInterceptedEmitFunction(emit: Emit): Emit {
    if (emit !== interceptedEmit) {
      interceptedEmit = interceptedEmit ?? ((event, ...args) => {
        emit(event, ...args)
        setupContext.emit(event, ...args)
      })
    }

    return interceptedEmit
  }

  /**
   * Intercept emit for assertions in populate wrapper emitted.
   */
  function interceptEmitOnCurrentInstance(): void {
    const currentInstance = getCurrentInstance()
    if (!currentInstance) {
      return
    }

    currentInstance.emit = getInterceptedEmitFunction(currentInstance.emit)
  }

  function patchInstanceAppContext() {
    const app = getCurrentInstance()?.appContext.app as typeof vueApp
    if (!app) return

    for (const [key, value] of Object.entries(vueApp)) {
      if (key in app) continue
      app[key] = value
    }
  }

  let passedProps: Record<string, unknown>
  let componentScope: ReturnType<typeof effectScope> | null = null

  const wrappedSetup = async (props: Record<string, unknown>, setupContext: SetupContext): Promise<unknown> => {
    interceptEmitOnCurrentInstance()

    passedProps = props

    if (setup) {
      let result
      if (options?.scoped) {
        componentScope = effectScope()

        // Add component scope cleanup to global cleanup
        globalThis.__cleanup ||= []
        globalThis.__cleanup.push(() => {
          componentScope?.stop()
        })
        result = await componentScope?.run(async () => {
          return await setup(props, setupContext)
        })
      }
      else {
        result = await setup(props, setupContext)
      }

      setupState = result && typeof result === 'object' ? result : {}
      return result
    }
  }

  return new Promise<ReturnType<typeof mount<T>> & { setupState: Record<string, unknown> }>(
    (resolve) => {
      const vm = mount(
        {
          __cssModules: componentRest.__cssModules,
          setup: (props: Record<string, unknown>, ctx: SetupContext) => {
            patchInstanceAppContext()

            setupContext = ctx

            if (options?.scoped) {
              const scope = effectScope()

              globalThis.__cleanup ||= []
              globalThis.__cleanup.push(() => {
                scope.stop()
              })
              return scope.run(() => NuxtRoot.setup(props, {
                ...ctx,
                expose: () => {},
              }))
            }
            else {
              return NuxtRoot.setup(props, {
                ...ctx,
                expose: () => {},
              })
            }
          },
          render: (renderContext: Record<string, unknown>) =>
            h(
              Suspense,
              {
                onResolve: () =>
                  nextTick().then(() => {
                    (vm as unknown as AugmentedVueInstance).setupState = setupState;
                    (vm as unknown as AugmentedVueInstance).__setProps = (props: Record<string, unknown>) => {
                      Object.assign(setProps, props)
                    }
                    resolve(wrappedMountedWrapper(vm as ReturnType<typeof mount<T>> & { setupState: Record<string, unknown> }))
                  }),
              },
              {
                default: () =>
                  h({
                    name: 'MountSuspendedHelper',
                    async setup() {
                      const router = useRouter()
                      await router.replace(route)

                      // Proxy top-level setup/render context so test wrapper resolves child component
                      const clonedComponent = {
                        name: 'MountSuspendedComponent',
                        ...component,
                        render: render
                          ? function (this: unknown, _ctx: Record<string, unknown>, ...args: unknown[]) {
                            interceptEmitOnCurrentInstance()

                            // Set before setupState set to allow asyncData to overwrite data
                            if (data && typeof data === 'function') {
                              // @ts-expect-error error TS2554: Expected 1 arguments, but got 0
                              const dataObject: Record<string, unknown> = data()
                              for (const key in dataObject) {
                                renderContext[key] = dataObject[key]
                              }
                            }
                            for (const key in setupState || {}) {
                              const warn = console.warn
                              console.warn = () => {}
                              try {
                                renderContext[key] = isReadonly(setupState[key]) ? unref(setupState[key]) : setupState[key]
                              }
                              catch {
                                // ignore errors setting properties that are not exposed to template
                              }
                              finally {
                                console.warn = warn
                              }
                              if (key === 'props') {
                                renderContext[key] = cloneProps(renderContext[key] as Record<string, unknown>)
                              }
                            }
                            const propsContext = 'props' in renderContext ? renderContext.props as Record<string, unknown> : renderContext
                            for (const key in props || {}) {
                              propsContext[key] = _ctx[key]
                            }
                            for (const key in passedProps || {}) {
                              propsContext[key] = passedProps[key]
                            }
                            if (methods && typeof methods === 'object') {
                              for (const [key, value] of Object.entries(methods)) {
                                renderContext[key] = value.bind(renderContext)
                              }
                            }
                            if (computed && typeof computed === 'object') {
                              for (const [key, value] of Object.entries(computed)) {
                                if ('get' in value) {
                                  renderContext[key] = value.get.call(renderContext)
                                }
                                else {
                                  renderContext[key] = value.call(renderContext)
                                }
                              }
                            }
                            return render.call(this, renderContext, ...args)
                          }
                          : undefined,
                        setup: (props: Record<string, unknown>) => wrappedSetup(props, setupContext),
                      }

                      return () => h(clonedComponent, { ...props, ...setProps, ...attrs }, slots)
                    },
                  }),
              },
            ),
        },
        defu(
          _options,
          {
            slots,
            attrs,
            global: {
              config: {
                globalProperties: {
                  ...vueApp.config.globalProperties,
                  // make all properties/keys enumerable.
                  ...Object.fromEntries(
                    Object.getOwnPropertyNames(vueApp.config.globalProperties)
                      .map(key => [key, vueApp.config.globalProperties[key]]),
                  ),
                },
              },
              directives: vueApp._context.directives,
              provide: vueApp._context.provides,
              stubs: {
                Suspense: false,
                MountSuspendedHelper: false,
                [component && typeof component === 'object' && 'name' in component && typeof component.name === 'string' ? component.name : 'MountSuspendedComponent']: false,
              },
              components: { ...vueApp._context.components, RouterLink },
            },
          } satisfies ComponentMountingOptions<T>,
        ) as ComponentMountingOptions<T>,
      )
    },
  )
}

interface AugmentedVueInstance {
  setupState?: Record<string, unknown>
  __setProps?: (props: Record<string, unknown>) => void
}

function cloneProps(props: Record<string, unknown>) {
  const newProps = reactive<Record<string, unknown>>({})
  for (const key in props) {
    newProps[key] = props[key]
  }
  return newProps
}

function wrappedMountedWrapper<T>(wrapper: ReturnType<typeof mount<T>> & { setupState: Record<string, unknown> }) {
  const proxy = new Proxy(wrapper, {
    get: (target, prop, receiver) => {
      if (prop === 'element') {
        const component = target.findComponent({ name: 'MountSuspendedComponent' })
        return component[prop]
      }
      else if (prop === 'vm') {
        const vm = Reflect.get(target, prop, receiver)
        return createVMProxy(vm as unknown as ComponentPublicInstance, wrapper.setupState)
      }
      else {
        return Reflect.get(target, prop, receiver)
      }
    },
  })

  for (const key of ['props'] as const) {
    proxy[key] = new Proxy(wrapper[key], {
      apply: (target, thisArg, args) => {
        const component = thisArg.findComponent({ name: 'MountSuspendedComponent' })
        return component[key](...args)
      },
    })
  }

  return proxy
}

function createVMProxy<T extends ComponentPublicInstance>(vm: T, setupState: Record<string, unknown>): T {
  return new Proxy(vm, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)

      if (setupState && typeof setupState === 'object' && key in setupState) {
        return unref(setupState[key as keyof typeof setupState])
      }

      return value
    },
    set(target, key, value, receiver) {
      if (setupState && typeof setupState === 'object' && key in setupState) {
        const setupValue = setupState[key as keyof typeof setupState]
        if (setupValue && isRef(setupValue)) {
          setupValue.value = value
          return true
        }

        return Reflect.set(setupState, key, value, receiver)
      }

      return Reflect.set(target, key, value, receiver)
    },
  })
}

declare global {
  var __cleanup: Array<() => void> | undefined
}
