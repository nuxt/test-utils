import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { h, DefineComponent, Suspense, nextTick, SetupContext } from 'vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

// @ts-expect-error virtual file
import NuxtRoot from '#build/root-component.mjs'
import { useRouter } from '#imports'

interface MountSuspendedOptions extends MountingOptions<any, any> {
  route?: RouteLocationRaw
}

export async function mountSuspended<
  T extends DefineComponent<any, any, any, any>
>(component: T, options?: MountSuspendedOptions) {
  const {
    props = {},
    attrs = {},
    slots = {},
    route = '/',
    ..._options
  } = options || {}

  // @ts-expect-error untyped global __unctx__
  const vueApp = globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const { render, setup } = component

  let setupContext: SetupContext
  return new Promise<VueWrapper<InstanceType<T>>>(resolve => {
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
                      render: render ? (_ctx: any, ...args: any[]) => render(renderContext, ...args) : undefined,
                      setup: setup ? (props: Record<string, any>, ctx: Record<string, any>) => setup(props, setupContext) : undefined
                    }

                    return () => h(clonedComponent, { ...props, ...attrs }, slots)
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
