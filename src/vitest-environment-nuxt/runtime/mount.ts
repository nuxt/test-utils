import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { h, DefineComponent, Suspense, nextTick } from 'vue'
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
  return new Promise<VueWrapper<InstanceType<T>>>(resolve => {
    const vm = mount(
      {
        setup: NuxtRoot.setup,
        render: () =>
          h(
            Suspense,
            { onResolve: () => nextTick().then(() => resolve(vm as any)) },
            {
              default: () =>
                h({
                  async setup() {
                    const router = useRouter()
                    await router.replace(route)
                    return () => h(component, { ...props, ...attrs }, slots)
                  },
                }),
            }
          ),
      },
      defu(_options, {
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
