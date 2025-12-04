import { mount } from '@vue/test-utils'
import type { ComponentMountingOptions } from '@vue/test-utils'
import { Suspense, h, nextTick, reactive, getCurrentInstance, effectScope } from 'vue'
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

type MountSuspendedResult<T> = ReturnType<typeof mount<T>> & { setupState: SetupState }

// TODO: improve return types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetupState = Record<string, any>

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
): Promise<MountSuspendedResult<T>> {
  const {
    props = {},
    attrs = {},
    slots = {},
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
  const { render, setup, ...componentRest } = component as DefineComponent<Record<string, unknown>, Record<string, unknown>>

  let wrappedInstance: ComponentInternalInstance | null = null
  let setupContext: SetupContext
  let setupState: Record<string, unknown>

  const setProps = reactive<Record<string, unknown>>({})

  function patchInstanceAppContext() {
    const app = getCurrentInstance()?.appContext.app as typeof vueApp
    if (!app) return

    for (const [key, value] of Object.entries(vueApp)) {
      if (key in app) continue
      app[key] = value
    }
  }

  let componentScope: ReturnType<typeof effectScope> | null = null

  const wrappedSetup = async (
    props: Record<string, unknown>,
    setupContext: SetupContext,
    instanceContext: SetupContext,
  ): Promise<unknown> => {
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
      currentInstance.emit = (event, ...args) => {
        setupContext.emit(event, ...args)
      }
    }

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

      if (wrappedInstance?.exposed) {
        instanceContext.expose(wrappedInstance.exposed)
      }

      setupState = result && typeof result === 'object' ? result : {}
      return result
    }
  }

  return new Promise<MountSuspendedResult<T>>(
    (resolve) => {
      const vm = mount(
        {
          __cssModules: componentRest.__cssModules,
          inheritAttrs: false,
          setup: (props: Record<string, unknown>, ctx: SetupContext) => {
            patchInstanceAppContext()

            wrappedInstance = getCurrentInstance()
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
          render: () =>
            h(
              Suspense,
              {
                onResolve: () =>
                  nextTick().then(() => {
                    (vm as unknown as AugmentedVueInstance).setupState = setupState;
                    (vm as unknown as AugmentedVueInstance).__setProps = (props: Record<string, unknown>) => {
                      Object.assign(setProps, props)
                    }
                    resolve(wrappedMountedWrapper(vm as MountSuspendedResult<T>))
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
                        components: {},
                        ...component,
                        name: 'MountSuspendedComponent',
                        setup: (props: Record<string, unknown>, ctx: SetupContext) =>
                          wrappedSetup(props, setupContext, ctx),
                      }

                      return () => h(clonedComponent, { ...props, ...setProps, ...attrs }, setupContext.slots)
                    },
                  }),
              },
            ),
        },
        defu(
          _options,
          {
            props: props as ComponentMountingOptions<T>['props'],
            slots: slots as ComponentMountingOptions<T>['slots'],
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

function wrappedMountedWrapper<T>(wrapper: MountSuspendedResult<T>) {
  const component = wrapper.findComponent({ name: 'MountSuspendedComponent' })
  const wrapperProps: (string | symbol)[] = [
    'setProps', 'emitted', 'setupState', 'unmount',
  ] satisfies (keyof typeof wrapper)[]
  return new Proxy(wrapper, {
    get: (_, prop, receiver) => {
      if (prop === 'getCurrentComponent') return getCurrentComponentPatchedProxy
      const target = wrapperProps.includes(prop)
        ? wrapper
        : Reflect.has(component, prop) ? component : wrapper
      const value = Reflect.get(target, prop, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })

  // for compatibity for nuxt/test-utils v3.20.0
  // cannot access setupState data via the proxy in original mount()
  function getCurrentComponentPatchedProxy() {
    const currentComponent = component.getCurrentComponent()
    return new Proxy(currentComponent, {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver)
        if (prop === 'proxy' && value) {
          return new Proxy(value, {
            get(o, p, r) {
              if (!Reflect.has(currentComponent.props, p)) {
                const setupState = wrapper.setupState
                if (setupState && typeof setupState === 'object') {
                  if (Reflect.has(setupState, p)) {
                    return Reflect.get(setupState, p, r)
                  }
                }
              }
              return Reflect.get(o, p, r)
            },
          })
        }
        return value
      },
    })
  }
}

declare global {
  var __cleanup: Array<() => void> | undefined
}

interface AugmentedVueInstance {
  setupState?: Record<string, unknown>
  __setProps?: (props: Record<string, unknown>) => void
}
