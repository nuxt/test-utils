import { mount } from '@vue/test-utils'
import type { ComponentMountingOptions } from '@vue/test-utils'
import { Suspense, h, nextTick } from 'vue'
import type { DefineComponent, SetupContext } from 'vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

// @ts-expect-error virtual file
import NuxtRoot from '#build/root-component.mjs'
import { useRouter } from '#imports'

export type MountSuspendedOptions<T> = ComponentMountingOptions<T> & {
  route?: RouteLocationRaw
}

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
  options?: MountSuspendedOptions<T>
): Promise<ReturnType<typeof mount<T>> & { setupState: any }> {
  const {
    props = {},
    attrs = {},
    slots = {} as ComponentMountingOptions<T>['slots'],
    route = '/',
    ..._options
  } = options || {}

  // @ts-expect-error untyped global __unctx__
  const vueApp = globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const { render, setup } = component as DefineComponent<any, any>

  let setupContext: SetupContext
  let setupState: any

  const wrappedSetup = async (
    props: Record<string, any>,
    setupContext: SetupContext
  ) => {
    if (setup) {
      setupState = await setup(props, setupContext)
      return setupState
    }
  }

  return new Promise<ReturnType<typeof mount<T>> & { setupState: any }>(
    resolve => {
      const vm = mount(
        {
          setup: (props: Record<string, any>, ctx: SetupContext) => {
            setupContext = ctx
            return NuxtRoot.setup(props, {
              ...ctx,
              expose: () => {},
            })
          },
          render: (renderContext: any) =>
            h(
              Suspense,
              {
                onResolve: () =>
                  nextTick().then(() => {
                    (vm as any).setupState = setupState
                    resolve(vm as any)
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
                          ? function (this: any, _ctx: any, ...args: any[]) {
                              for (const key in props || {}) {
                                renderContext[key] = _ctx[key]
                              }
                              for (const key in setupState || {}) {
                                renderContext[key] = setupState[key]
                              }
                              return render.call(this, renderContext, ...args)
                            }
                          : undefined,
                        setup: setup ? (props: Record<string, any>) => wrappedSetup(props, setupContext) : undefined,
                      }

                      return () => h(clonedComponent, { ...props, ...attrs }, slots)
                    },
                  }),
              }
            ),
        },
        defu(
          _options,
          {
            slots,
            global: {
              config: {
                globalProperties: vueApp.config.globalProperties,
              },
              provide: vueApp._context.provides,
              stubs: {
                Suspense: false,
                MountSuspendedHelper: false,
                [typeof (component as any).name === 'string' ? (component as any).name : 'MountSuspendedComponent']: false
              },
              components: { RouterLink },
            },
          } satisfies ComponentMountingOptions<T>
        ) as ComponentMountingOptions<T>
      )
    }
  )
}
