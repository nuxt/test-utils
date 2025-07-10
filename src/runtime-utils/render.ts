import { Suspense, effectScope, h, nextTick, isReadonly, reactive, unref, defineComponent } from 'vue'
import type { DefineComponent, SetupContext } from 'vue'
import type { RenderOptions as TestingLibraryRenderOptions } from '@testing-library/vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

import NuxtRoot from '#build/root-component.mjs'
import { tryUseNuxtApp, useRouter } from '#imports'

type RenderOptions<C = unknown> = TestingLibraryRenderOptions<C> & {
  route?: RouteLocationRaw
}

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
export async function renderSuspended<T>(component: T, options?: RenderOptions<T>) {
  const {
    props = {},
    attrs = {},
    slots = {},
    route = '/',
    ..._options
  } = options || {}

  const { render: renderFromTestingLibrary } = await import('@testing-library/vue')

  const vueApp = tryUseNuxtApp()?.vueApp
    // @ts-expect-error untyped global __unctx__
    || globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const {
    computed,
    data,
    methods,
    render,
    setup,
  } = component as DefineComponent<Record<string, unknown>, Record<string, unknown>>

  let setupContext: SetupContext
  let setupState: SetupState

  let interceptedEmit: ((event: string, ...args: unknown[]) => void) | null = null
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
  function getInterceptedEmitFunction(
    emit: ((event: string, ...args: unknown[]) => void),
  ): ((event: string, ...args: unknown[]) => void) {
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
    if (currentInstance == null) {
      return
    }

    currentInstance.emit = getInterceptedEmitFunction(currentInstance.emit)
  }

  // cleanup previously mounted test wrappers
  for (const fn of window.__cleanup || []) {
    fn()
  }
  document.querySelector(`#${WRAPPER_EL_ID}`)?.remove()

  let passedProps: Record<string, unknown>
  const wrappedSetup = async (
    props: Record<string, unknown>,
    setupContext: SetupContext,
  ) => {
    interceptEmitOnCurrentInstance()

    passedProps = props
    if (setup) {
      const result = await setup(props, setupContext)
      setupState = result && typeof result === 'object' ? result : {}
      return result
    }
  }

  const WrapperComponent = defineComponent({
    inheritAttrs: false,
    render() {
      return h('div', { id: WRAPPER_EL_ID }, this.$slots.default?.())
    },
  })
  return new Promise<ReturnType<typeof renderFromTestingLibrary> & { setupState: SetupState }>((resolve) => {
    const utils = renderFromTestingLibrary(
      {
        setup: (props: Record<string, unknown>, ctx: SetupContext) => {
          setupContext = ctx

          const scope = effectScope()

          window.__cleanup ||= []
          window.__cleanup.push(() => {
            scope.stop()
          })

          return scope.run(() => NuxtRoot.setup(props, {
            ...ctx,
            expose: () => ({}),
          }))
        },
        render: (renderContext: Record<string, unknown>) =>
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
                      (utils as unknown as AugmentedVueInstance).setupState = setupState
                      resolve(utils as ReturnType<typeof renderFromTestingLibrary> & { setupState: SetupState })
                    }),
                },
                {
                  default: () =>
                    h({
                      name: 'RenderHelper',
                      async setup() {
                        const router = useRouter()
                        await router.replace(route)

                        // Proxy top-level setup/render context so test wrapper resolves child component
                        const clonedComponent = {
                          name: 'RenderSuspendedComponent',
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
                                console.warn = () => { }
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

                        return () => h(clonedComponent, { ...(props && typeof props === 'object' ? props : {}), ...attrs }, slots)
                      },
                    }),
                },
              ),
            },
          ),
      },
      defu(_options, {
        slots,
        attrs,
        global: {
          config: {
            globalProperties: vueApp.config.globalProperties,
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

function cloneProps(props: Record<string, unknown>) {
  const newProps = reactive<Record<string, unknown>>({})
  for (const key in props) {
    newProps[key] = props[key]
  }
  return newProps
}
