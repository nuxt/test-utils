import { Suspense, effectScope, h, nextTick, reactive, defineComponent, getCurrentInstance } from 'vue'
import type { App, ComponentInternalInstance, DefineComponent, SetupContext } from 'vue'
import type { RenderResult, RenderOptions as TestingLibraryRenderOptions } from '@testing-library/vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

import NuxtRoot from '#build/root-component.mjs'
import { tryUseNuxtApp, useRouter, onErrorCaptured } from '#imports'

type RenderSuspendeOptions<T> = TestingLibraryRenderOptions<T> & {
  route?: RouteLocationRaw
}

type RenderSuspendeResult = RenderResult & { setupState: SetupState }

const WRAPPER_EL_ID = 'test-wrapper'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetupState = Record<string, any>

/**
 * `renderSuspended` allows you to mount any vue component within the Nuxt environment, allowing async setup and access to injections from your Nuxt plugins.
 *
 * This is a wrapper around the `render` function from @testing-libary/vue, and should be used together with
 * utilities from that package.
 *
 * ```ts
 * // tests/components/SomeComponents.nuxt.spec.ts
 * import { renderSuspended } from '@nuxt/test-utils/runtime'
 *
 * it('can render some component', async () => {
 * const { html } = await renderSuspended(SomeComponent)
 * expect(html()).toMatchInlineSnapshot(
 * 'This is an auto-imported component'
 * )
 *
 * })
 *
 * // tests/App.nuxt.spec.ts
 * import { renderSuspended } from '@nuxt/test-utils/runtime'
 * import { screen } from '@testing-library/vue'
 *
 * it('can also mount an app', async () => {
 * const { html } = await renderSuspended(App, { route: '/test' })
 * expect(screen.getByRole('link', { name: 'Test Link' })).toBeVisible()
 * })
 * ```
 * @param component the component to be tested
 * @param options optional options to set up your component
 */
export async function renderSuspended<T>(component: T, options?: RenderSuspendeOptions<T>) {
  const {
    props = {},
    attrs = {},
    slots = {},
    route = '/',
    ..._options
  } = options || {}

  const { render: renderFromTestingLibrary } = await import('@testing-library/vue')

  const vueApp: App<Element> & Record<string, unknown> = tryUseNuxtApp()?.vueApp
    // @ts-expect-error untyped global __unctx__
    || globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const { render, setup, ...componentRest } = component as DefineComponent<Record<string, unknown>, Record<string, unknown>>

  let wrappedInstance: ComponentInternalInstance | null = null
  let setupContext: SetupContext
  let setupState: SetupState

  const setProps = reactive<Record<string, unknown>>({})

  function patchInstanceAppContext() {
    const app = getCurrentInstance()?.appContext.app as typeof vueApp
    if (!app) return

    for (const [key, value] of Object.entries(vueApp)) {
      if (key in app) continue
      app[key] = value
    }
  }

  // cleanup previously mounted test wrappers
  for (const fn of window.__cleanup || []) {
    fn()
  }
  document.querySelector(`#${WRAPPER_EL_ID}`)?.remove()

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
      const result = await setup(props, setupContext)
      setupState = result && typeof result === 'object' ? result : {}
      if (wrappedInstance?.exposed) {
        instanceContext.expose(wrappedInstance.exposed)
      }
      return result
    }
  }

  const WrapperComponent = defineComponent({
    inheritAttrs: false,
    render() {
      return h('div', { id: WRAPPER_EL_ID }, this.$slots.default?.())
    },
  })
  return new Promise<RenderSuspendeResult>((resolve, reject) => {
    let isMountSettled = false
    const utils = renderFromTestingLibrary(
      {
        __cssModules: componentRest.__cssModules,
        inheritAttrs: false,
        setup: (props: Record<string, unknown>, ctx: SetupContext) => {
          patchInstanceAppContext()

          wrappedInstance = getCurrentInstance()
          setupContext = ctx

          const scope = effectScope()

          window.__cleanup ||= []
          window.__cleanup.push(() => {
            scope.stop()
          })

          const nuxtRootSetupResult = scope.run(() => NuxtRoot.setup(props, {
            ...ctx,
            expose: () => ({}),
          }))

          onErrorCaptured((error, ...args) => {
            if (isMountSettled) return
            isMountSettled = true
            try {
              wrappedInstance?.appContext.config.errorHandler?.(error, ...args)
              reject(error)
            }
            catch (error) {
              reject(error)
            }
            return false
          })

          return nuxtRootSetupResult
        },
        render: () =>
          // See discussions in https://github.com/testing-library/vue-testing-library/issues/230
          // we add this additional root element because otherwise testing-library breaks
          // because there's no root element while Suspense is resolving
          h(
            WrapperComponent,
            {},
            {
              default: () => h(
                Suspense,
                {
                  onResolve: () =>
                    nextTick().then(() => {
                      if (isMountSettled) return
                      isMountSettled = true;
                      (utils as unknown as AugmentedVueInstance).setupState = setupState
                      utils.rerender = async (props) => {
                        Object.assign(setProps, props)
                        await nextTick()
                      }
                      resolve(utils as RenderSuspendeResult)
                    }),
                },
                {
                  default: () =>
                    h({
                      name: 'RenderHelper',
                      render: () => '',
                      async setup() {
                        const router = useRouter()
                        await router.replace(route)

                        // Proxy top-level setup/render context so test wrapper resolves child component
                        const clonedComponent = {
                          components: {},
                          ...component,
                          name: 'RenderSuspendedComponent',
                          render: render,
                          setup: (props: Record<string, unknown>, ctx: SetupContext) =>
                            wrappedSetup(props, setupContext, ctx),
                        }

                        return () => h(clonedComponent, { ...(props && typeof props === 'object' ? props : {}), ...setProps, ...attrs }, setupContext.slots)
                      },
                    }),
                },
              ),
            },
          ),
      },
      defu(_options, {
        props: props as object,
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
          components: { RouterLink },
        },
      }),
    )
  })
}

declare global {
  interface Window {
    __cleanup?: Array<() => void>
  }
}

interface AugmentedVueInstance {
  setupState?: SetupState
}
