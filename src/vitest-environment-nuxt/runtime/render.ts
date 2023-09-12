import {
  type DefineComponent,
  type SetupContext,
  Suspense,
  h,
  nextTick,
} from 'vue'
import type {
   RenderOptions as TestingLibraryRenderOptions,
} from '@testing-library/vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

// @ts-expect-error virtual file
import NuxtRoot from '#build/root-component.mjs'
import { useRouter } from '#imports'

export type RenderOptions = TestingLibraryRenderOptions & {
  route?: RouteLocationRaw
}

export const WRAPPER_EL_ID = 'test-wrapper'

/**
 * `renderSuspended` allows you to mount any vue component within the Nuxt environment, allowing async setup and access to injections from your Nuxt plugins.
 *
 * This is a wrapper around the `render` function from @testing-libary/vue, and should be used together with
 * utilities from that package.
 *
 * ```ts
 * // tests/components/SomeComponents.nuxt.spec.ts
 * import { renderSuspended } from 'nuxt-vitest/utils'
 *
 * it('can render some component', async () => {
 *     const { html } = await renderSuspended(SomeComponent)
 *     expect(html()).toMatchInlineSnapshot(
 *         'This is an auto-imported component'
 *     )
 *
 * })
 *
 * // tests/App.nuxt.spec.ts
 * import { renderSuspended } from 'nuxt-vitest/utils'
 * import { screen } from '@testing-library/vue'
 *
 * it('can also mount an app', async () => {
 *     const { html } = await renderSuspended(App, { route: '/test' })
 *     expect(screen.getByRole('link', { name: 'Test Link' })).toBeVisible()
 * })
 * ```
 *
 * @param component the component to be tested
 * @param options optional options to set up your component
 */
export async function renderSuspended<T>(
  component: T,
  options?: RenderOptions
) {
  const {
    props = {},
    attrs = {},
    slots = {},
    route = '/',
    ..._options
  } = options || {}

  const { render : renderFromTestingLibrary } = await import('@testing-library/vue')

  // @ts-ignore untyped global __unctx__
  const { vueApp } = globalThis.__unctx__.get('nuxt-app').tryUse()
  const { render, setup } = component as DefineComponent<any, any>

  let setupContext: SetupContext

  return new Promise<ReturnType<typeof renderFromTestingLibrary>>(resolve => {
    const utils = renderFromTestingLibrary(
      {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        setup: (props: any, ctx: any) => {
          setupContext = ctx

          return NuxtRoot.setup(props, {
            ...ctx,
            expose: () => {},
          })
        },
        render: (renderContext: any) =>
          // See discussions in https://github.com/testing-library/vue-testing-library/issues/230
          // we add this additional root element because otherwise testing-library breaks
          // because there's no root element while Suspense is resolving
          h(
            'div',
            { id: WRAPPER_EL_ID },
            h(
              Suspense,
              { onResolve: () => nextTick().then(() => resolve(utils)) },
              {
                default: () =>
                  h({
                    async setup() {
                      const router = useRouter()
                      await router.replace(route)

                      // Proxy top-level setup/render context so test wrapper resolves child component
                      const clonedComponent = {
                        ...component,
                        render: render
                          ? (_ctx: any, ...args: any[]) =>
                              render(renderContext, ...args)
                          : undefined,
                        setup: setup
                          ? // eslint-disable-next-line @typescript-eslint/no-shadow
                            (props: Record<string, any>) =>
                              setup(props, setupContext)
                          : undefined,
                      }

                      return () =>
                        h(clonedComponent, { ...props, ...attrs }, slots)
                    },
                  }),
              }
            )
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
      })
    )
  })
}
