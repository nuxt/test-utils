import { mount, ComponentMountingOptions } from '@vue/test-utils'
import { h, Suspense, nextTick, SetupContext, DefineComponent } from 'vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

// @ts-expect-error virtual file
import NuxtRoot from '#build/root-component.mjs'
import { useRouter } from '#imports'

export type MountSuspendedOptions<T> = ComponentMountingOptions<T> & {
  route?: RouteLocationRaw
}

export async function mountSuspended<T>(
  component: T,
  options?: MountSuspendedOptions<T>
) {
  const {
    props = {},
    attrs = {},
    slots = {},
    route = '/',
    ..._options
  } = options || {}

  // @ts-expect-error untyped global __unctx__
  const vueApp = globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const { render, setup } = component as DefineComponent<any, any>

  let setupContext: SetupContext
  return new Promise<
    ReturnType<
      // @ts-expect-error letting uncertainty flow like water
      typeof mount<T>
    >
  >(resolve => {
    const vm = mount(
      {
        setup: (props, ctx) => {
          setupContext = ctx
          return NuxtRoot.setup(props, {
            ...ctx,
            expose: () => {},
          })
        },
        render: (renderContext: any) =>
          h(
            Suspense,
            { onResolve: () => nextTick().then(() => resolve(vm as any)) },
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
                        ? (props: Record<string, any>) =>
                            setup(props, setupContext)
                        : undefined,
                    }

                    return () =>
                      h(clonedComponent, { ...props, ...attrs }, slots)
                  },
                }),
            }
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
