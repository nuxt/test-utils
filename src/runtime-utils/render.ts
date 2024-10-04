import { Suspense, effectScope, h, nextTick, isReadonly, unref } from 'vue'
import type { DefineComponent, SetupContext } from 'vue'
import type { RenderOptions as TestingLibraryRenderOptions } from '@testing-library/vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

import NuxtRoot from '#build/root-component.mjs'
import { tryUseNuxtApp, useRouter } from '#imports'

export type RenderOptions<C = unknown> = TestingLibraryRenderOptions<C> & {
  route?: RouteLocationRaw
}

export const WRAPPER_EL_ID = 'test-wrapper'

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
export async function renderSuspended<T>(
  component: T,
  options?: RenderOptions<T>,
) {
  const {
    props = {},
    attrs = {},
    slots = {},
    route = '/',
    ..._options
  } = options || {}

  const { render: renderFromTestingLibrary } = await import(
    '@testing-library/vue'
  )

  const vueApp = tryUseNuxtApp()?.vueApp
    // @ts-expect-error untyped global __unctx__
    || globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const { render, setup } = component as DefineComponent<Record<string, unknown>, Record<string, unknown>>

  let setupContext: SetupContext
  let setupState: SetupState

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
    passedProps = props
    if (setup) {
      const result = await setup(props, setupContext)
      setupState = result && typeof result === 'object' ? result : {}
      return result
    }
  }

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
            'div',
            { id: WRAPPER_EL_ID },
            h(
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
                            // Set before setupState set to allow asyncData to overwrite data
                            // if (data && typeof data === 'function') {
                            //   // @ts-expect-error error TS2554: Expected 1 arguments, but got 0
                            //   const dataObject: Record<string, unknown> = data()
                            //   for (const key in dataObject) {
                            //     renderContext[key] = dataObject[key]
                            //   }
                            // }
                            for (const key in setupState || {}) {
                              renderContext[key] = isReadonly(setupState[key]) ? unref(setupState[key]) : setupState[key]
                            }
                            for (const key in props || {}) {
                              renderContext[key] = _ctx[key]
                            }
                            for (const key in passedProps || {}) {
                              renderContext[key] = passedProps[key]
                            }
                            // if (methods && typeof methods === 'object') {
                            //   for (const key in methods) {
                            //     renderContext[key] = methods[key]
                            //   }
                            // }
                            // if (computed && typeof computed === 'object') {
                            //   for (const key in computed) {
                            //     // @ts-expect-error error TS2339: Property 'call' does not exist on type 'ComputedGetter<any> | WritableComputedOptions<any, any>'
                            //     renderContext[key] = computed[key].call(renderContext)
                            //   }
                            // }
                            return render.call(this, renderContext, ...args)
                          }
                          : undefined,
                        setup: setup ? (props: Record<string, unknown>) => wrappedSetup(props, setupContext) : undefined,
                      }

                      return () => h(clonedComponent, { ...(props && typeof props === 'object' ? props : {}), ...attrs }, slots)
                    },
                  }),
              },
            ),
          ),
      },
      defu(_options, {
        slots,
        global: {
          config: {
            globalProperties: vueApp.config.globalProperties,
          },
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
