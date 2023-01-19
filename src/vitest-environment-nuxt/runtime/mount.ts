import { mount, VueWrapper } from '@vue/test-utils'
import { h, DefineComponent, Suspense, nextTick } from 'vue'

import { RouterLink } from './components/RouterLink'

// @ts-expect-error virtual file
import NuxtRoot from '#build/root-component.mjs'

export async function mountSuspended<
  T extends DefineComponent<any, any, any, any>
>(component: T) {
  return new Promise<VueWrapper<InstanceType<T>>>(resolve => {
    const vm = mount(
      {
        setup: NuxtRoot.setup,
        render: () =>
          h(
            Suspense,
            { onResolve: () => nextTick().then(() => resolve(vm as any)) },
            { default: () => h(component) }
          ),
      },
      {
        global: {
          components: {
            RouterLink,
          },
        },
      }
    )
  })
}
