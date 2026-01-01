import { Suspense, effectScope, h, nextTick, reactive, getCurrentInstance, onErrorCaptured } from 'vue'
import type { App, ComponentInternalInstance, DefineComponent, SetupContext, VNode } from 'vue'
import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'
import type { ComponentMountingOptions } from '@vue/test-utils'

import { tryUseNuxtApp, useRouter } from '#imports'
import NuxtRoot from '#build/root-component.mjs'

import { RouterLink } from '../components/RouterLink'

// TODO: improve return types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetupState = Record<string, any>

type BaseOptions<C> = Pick<ComponentMountingOptions<C>, 'global'>

type WrapperFn<C> = (c: C, o?: BaseOptions<C>) => unknown
type WrapperFnComponent<Fn> = Fn extends (c: infer C, o: infer _) => infer _ ? C : never
type WrapperFnOption<Fn> = Fn extends (c: WrapperFnComponent<Fn>, o: infer O) => infer _ ? O : never
type WrapperFnResult<Fn> = Fn extends (c: WrapperFnComponent<Fn>, o: WrapperFnOption<Fn>) => infer R ? R : never

export type WrapperSuspendedOptions<Fn> = WrapperFnOption<Fn> & {
  route?: RouteLocationRaw | false
  scoped?: boolean
}

export type WrapperSuspendedResult<Fn> = WrapperFnResult<Fn> & {
  setupState: SetupState
}

export function cleanupAll() {
  for (const fn of (window.__cleanup || []).splice(0)) {
    fn()
  }
}

function addCleanup(fn: () => unknown) {
  window.__cleanup ||= []
  window.__cleanup.push(fn)
}

function runEffectScope<T>(fn: () => T) {
  const scope = effectScope()
  addCleanup(() => scope.stop())
  return scope.run(fn)
}

export function wrapperSuspended<C, Fn extends WrapperFn<C>>(
  component: C,
  options: WrapperSuspendedOptions<Fn>,
  {
    wrapperFn,
    wrappedRender = fn => fn,
    suspendedHelperName,
    clonedComponentName,
  }: {
    wrapperFn: NonNullable<Fn>
    wrappedRender?: (render: () => VNode) => () => VNode
    suspendedHelperName: string
    clonedComponentName: string
  },
): Promise<{
  wrapper: WrapperSuspendedResult<Fn>
  setProps: (props: object) => void
}> {
  const { props = {}, attrs = {} } = options as ComponentMountingOptions<C>
  const { route = '/', scoped = false, ...wrapperFnOptions } = options

  const vueApp: App<Element> & Record<string, unknown> = tryUseNuxtApp()?.vueApp
    // @ts-expect-error untyped global __unctx__
    || globalThis.__unctx__.get('nuxt-app').tryUse().vueApp
  const {
    render: componentRender,
    setup: componentSetup,
    ...componentRest
  } = component as DefineComponent<Record<string, unknown>, Record<string, unknown>>

  let wrappedInstance: ComponentInternalInstance | null = null
  let setupContext: SetupContext
  let setupState: SetupState

  const setProps = reactive<Record<string, unknown>>({})

  function patchInstanceAppContext() {
    const app = getCurrentInstance()?.appContext.app as typeof vueApp
    if (!app) return

    for (const [key, value] of Object.entries(vueApp)) {
      if (key in app) continue
      app[key] = value
    }
  }

  const ClonedComponent = {
    components: {},
    ...component,
    name: clonedComponentName,
    async setup(props: Record<string, unknown>, instanceContext: SetupContext) {
      const currentInstance = getCurrentInstance()
      if (currentInstance) {
        currentInstance.emit = (event, ...args) => {
          setupContext.emit(event, ...args)
        }
      }

      if (!componentSetup) return

      const result = scoped
        ? await runEffectScope(() => componentSetup(props, setupContext))
        : await componentSetup(props, setupContext)

      if (wrappedInstance?.exposed) {
        instanceContext.expose(wrappedInstance.exposed)
      }

      setupState = result && typeof result === 'object' ? result : {}

      return result
    },
  }

  const SuspendedHelper = {
    name: suspendedHelperName,
    render: () => '',
    async setup() {
      if (route) {
        const router = useRouter()
        await router.replace(route)
      }
      return () => h(ClonedComponent, { ...props, ...setProps, ...attrs }, setupContext.slots)
    },
  }

  return new Promise((resolve, reject) => {
    let isMountSettled = false

    const wrapper = wrapperFn(
      {
        inheritAttrs: false,
        __cssModules: componentRest.__cssModules,
        setup: (props: Record<string, unknown>, ctx: SetupContext) => {
          patchInstanceAppContext()

          wrappedInstance = getCurrentInstance()
          setupContext = ctx

          const nuxtRootSetupResult = runEffectScope(
            () => NuxtRoot.setup(props, {
              ...ctx,
              expose: () => {},
            }),
          )

          onErrorCaptured((error, ...args) => {
            if (isMountSettled) return
            isMountSettled = true
            try {
              wrappedInstance?.appContext.config.errorHandler?.(error, ...args)
              reject(error)
            }
            catch (error) {
              reject(error)
            }
            return false
          })

          return nuxtRootSetupResult
        },
        render: wrappedRender(() => h(
          Suspense,
          {
            onResolve: () =>
              nextTick().then(() => {
                if (isMountSettled) return
                isMountSettled = true

                wrapper.setupState = setupState

                resolve({
                  wrapper,
                  setProps: (props) => {
                    Object.assign(setProps, props)
                  },
                })
              }),
          },
          {
            default: () => h(SuspendedHelper),
          },
        )),
      } as C,
      defu(wrapperFnOptions, {
        global: {
          config: {
            globalProperties: makeAllPropertiesEnumerable(
              vueApp.config.globalProperties,
            ),
          },
          directives: vueApp._context.directives,
          provide: vueApp._context.provides,
          stubs: {
            Suspense: false,
            [SuspendedHelper.name]: false,
            [ClonedComponent.name]: false,
          },
          components: { ...vueApp._context.components, RouterLink },
        },
      } satisfies ComponentMountingOptions<C>),
    ) as WrapperSuspendedResult<Fn>
  })
}

function makeAllPropertiesEnumerable<V, T extends Record<string, V>>(target: T) {
  return {
    ...target,
    ...Object.fromEntries(
      Object.getOwnPropertyNames(target).map(key => [key, target[key]]),
    ),
  } as T
}

declare global {
  interface Window {
    __cleanup?: Array<() => void>
  }
}
