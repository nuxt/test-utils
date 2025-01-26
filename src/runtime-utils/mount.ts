import { mount } from '@vue/test-utils'
import type { ComponentMountingOptions } from '@vue/test-utils'
import { Suspense, h, isReadonly, nextTick, reactive, unref, getCurrentInstance } from 'vue'
import type { DefineComponent, SetupContext } from 'vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'

import { RouterLink } from './components/RouterLink'

import NuxtRoot from '#build/root-component.mjs'
import { tryUseNuxtApp, useRouter } from '#imports'

type MountSuspendedOptions<T> = ComponentMountingOptions<T> & {
  route?: RouteLocationRaw
}

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
): Promise<ReturnType<typeof mount<T>> & { setupState: SetupState }> {
  const {
    props = {},
    attrs = {},
    slots = {} as ComponentMountingOptions<T>['slots'],
    route = '/',
    ..._options
  } = options || {}

  const vueApp = tryUseNuxtApp()?.vueApp
    // @ts-expect-error untyped global __unctx__
    || globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const { render, setup, data, computed, methods } = component as DefineComponent<Record<string, unknown>, Record<string, unknown>>

  let setupContext: SetupContext
  let setupState: Record<string, unknown>
  const setProps = reactive<Record<string, unknown>>({})

  let passedProps: Record<string, unknown>
  const wrappedSetup = async (props: Record<string, unknown>, setupContext: SetupContext) => {
    passedProps = props
    if (setup) {
      const result = await setup(props, setupContext)
      setupState = result && typeof result === 'object' ? result : {}
      return result
    }
  }

  return new Promise<ReturnType<typeof mount<T>> & { setupState: Record<string, unknown> }>(
    (resolve) => {
      const vm = mount(
        {
          setup: (props: Record<string, unknown>, ctx: SetupContext) => {
            setupContext = ctx
            return NuxtRoot.setup(props, {
              ...ctx,
              expose: () => {},
            })
          },
          render: (renderContext: Record<string, unknown>) =>
            h(
              Suspense,
              {
                onResolve: () =>
                  nextTick().then(() => {
                    (vm as unknown as AugmentedVueInstance).setupState = setupState;
                    (vm as unknown as AugmentedVueInstance).__setProps = (props: Record<string, unknown>) => {
                      Object.assign(setProps, props)
                    }
                    vm.props = new Proxy(vm.props, {
                      apply: (target, thisValue, args) => {
                        const component = thisValue.findComponent({ name: 'MountSuspendedComponent' })
                        return component.props(...args)
                      },
                    })
                    resolve(vm as ReturnType<typeof mount<T>> & { setupState: Record<string, unknown> })
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
                          ? function (this: unknown, _ctx: Record<string, unknown>, ...args: unknown[]) {
                            // When using defineModel, getCurrentInstance().emit is executed internally. it needs to override.
                            const currentInstance = getCurrentInstance()
                            if (currentInstance) {
                              currentInstance.emit = setupContext.emit
                            }
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
                              console.warn = () => {}
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
                              for (const key in methods) {
                                renderContext[key] = methods[key].bind(renderContext)
                              }
                            }
                            if (computed && typeof computed === 'object') {
                              for (const key in computed) {
                                // @ts-expect-error error TS2339: Property 'call' does not exist on type 'ComputedGetter<any> | WritableComputedOptions<any, any>'
                                renderContext[key] = computed[key].call(renderContext)
                              }
                            }
                            return render.call(this, renderContext, ...args)
                          }
                          : undefined,
                        setup: setup ? (props: Record<string, unknown>) => wrappedSetup(props, setupContext) : undefined,
                      }

                      return () => h(clonedComponent, { ...props, ...setProps, ...attrs }, slots)
                    },
                  }),
              },
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

interface AugmentedVueInstance {
  setupState?: Record<string, unknown>
  __setProps?: (props: Record<string, unknown>) => void
}

function cloneProps(props: Record<string, unknown>) {
  const newProps = reactive<Record<string, unknown>>({})
  for (const key in props) {
    newProps[key] = props[key]
  }
  return newProps
}
