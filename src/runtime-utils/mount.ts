import { mount as wrapperFn } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { cleanupAll, wrapperSuspended } from './utils/suspended'
import type { WrapperSuspendedOptions, WrapperSuspendedResult } from './utils/suspended'

type WrapperFn<C> = typeof wrapperFn<C>
type WrapperOptions<C> = WrapperSuspendedOptions<WrapperFn<C>>
type WrapperResult<C> = WrapperSuspendedResult<WrapperFn<C>>

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
  options: WrapperOptions<T> = {},
): Promise<WrapperResult<T>> {
  const suspendedHelperName = 'MountSuspendedHelper'
  const clonedComponentName = 'MountSuspendedComponent'

  cleanupAll()

  const { wrapper, setProps } = await wrapperSuspended(component, options, {
    wrapperFn,
    suspendedHelperName,
    clonedComponentName,
  })

  Object.assign(wrapper, { __setProps: setProps })

  const clonedComponent = wrapper.findComponent({ name: clonedComponentName })

  return wrappedMountedWrapper(wrapper, clonedComponent)
}

function wrappedMountedWrapper<T>(wrapper: WrapperResult<T>, component: VueWrapper) {
  const wrapperProps: (string | symbol)[] = [
    'setProps', 'emitted', 'setupState', 'unmount',
  ] satisfies (keyof typeof wrapper)[]
  return new Proxy(wrapper, {
    get: (_, prop, receiver) => {
      if (prop === 'getCurrentComponent') return getCurrentComponentPatchedProxy
      const target = wrapperProps.includes(prop)
        ? wrapper
        : Reflect.has(component, prop) ? component : wrapper
      const value = Reflect.get(target, prop, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })

  // for compatibity for nuxt/test-utils v3.20.0
  // cannot access setupState data via the proxy in original mount()
  function getCurrentComponentPatchedProxy() {
    const currentComponent = component.getCurrentComponent()
    return new Proxy(currentComponent, {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver)
        if (prop === 'proxy' && value) {
          return new Proxy(value, {
            get(o, p, r) {
              if (!Reflect.has(currentComponent.props, p)) {
                const setupState = wrapper.setupState
                if (setupState && typeof setupState === 'object') {
                  if (Reflect.has(setupState, p)) {
                    return Reflect.get(setupState, p, r)
                  }
                }
              }
              return Reflect.get(o, p, r)
            },
          })
        }
        return value
      },
    })
  }
}
