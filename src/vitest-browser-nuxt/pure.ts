import type { Locator, LocatorSelectors, PrettyDOMOptions } from 'vitest/browser'
import { page, server, utils } from 'vitest/browser'
import { mount as wrapperFn } from '@vue/test-utils'

import type { WrapperSuspendedOptions } from '../runtime-utils/utils/suspended.ts'
import { cleanupAll, wrapperSuspended } from '../runtime-utils/utils/suspended.ts'

export { config } from '@vue/test-utils'

type OmitKey<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] }

type ComponentProps<T> = T extends new (...args: never[]) => {
  $props: infer P
} ? NonNullable<P> : T extends (props: infer P, ...args: never[]) => unknown ? P : object

type WrapperFn<C> = typeof wrapperFn<C>
type WrapperOptions<C> = OmitKey<WrapperSuspendedOptions<WrapperFn<C>>, 'attachTo'> & {
  /** Use this option instead of the `@vue/test-utils` `attachTo` option. */
  container?: HTMLElement
  baseElement?: HTMLElement
}

const mountedWrappers = new Set<Pick<ReturnType<typeof wrapperFn>, 'unmount'>>()

let idx = 0
function ensureTestIdAttribute(element: HTMLElement) {
  const attributeId = server.config.browser.locators.testIdAttribute
  if (!element.hasAttribute(attributeId)) {
    element.setAttribute(attributeId, `__vitest_${idx++}__`)
  }
}

export interface RenderResult<Props> extends LocatorSelectors {
  container: HTMLElement
  baseElement: HTMLElement
  locator: Locator
  debug(
    el?: HTMLElement | HTMLElement[] | Locator | Locator[],
    maxLength?: number, options?:
    PrettyDOMOptions
  ): void
  /** Unmount the component. Also records a `nuxt.unmount` trace mark. */
  unmount(): Promise<void>
  emitted<T = unknown>(): Record<string, T[]>
  emitted<T = unknown[]>(eventName: string): undefined | T[]
  /** Re-render the component with new props. Also records a `nuxt.rerender` trace mark. */
  rerender(props: Partial<Props>): Promise<void>
}

/**
 * `render` allows you to mount any vue component within the vitest browser mode.
 *
 * ```ts
 * import { page } from 'vitest/browser'
 * import { render } from '@nuxt/test-utils/vitest-browser-nuxt'
 *
 * it('can render', async () => {
 *   const screen = await render(App, { route: '/' })
 *
 *   const title = screen.getByRole('heading')
 *   await expect.element(title).toHaveTextContent('Index')
 * })
 *
 * it('can render with page', async () => {
 *   const screen = await page.render(App, { route: '/' })
 *
 *   const title = screen.getByRole('heading')
 *   await expect.element(title).toHaveTextContent('Index')
 * })
 * ```
 *
 * @param component the component to be tested
 * @param options optional options to set up your component
 */
export async function render<T>(
  component: T,
  options: WrapperOptions<T> = {},
): Promise<RenderResult<ComponentProps<T>>> {
  const {
    container,
    baseElement,
    wrapper,
  } = await mountWrapperSuspended(component, options)

  ensureTestIdAttribute(container)
  ensureTestIdAttribute(baseElement)

  const { debug, getElementLocatorSelectors } = utils

  const renderResult: RenderResult<ComponentProps<T>> = {
    container,
    baseElement,
    locator: page.elementLocator(container),
    debug: (el = container, maxLength, options) => debug(el, maxLength, options),
    unmount: async () => {
      wrapper.unmount()
      mountedWrappers.delete(wrapper)
      await mark(renderResult.locator, 'nuxt.unmount', renderResult.rerender)
    },
    emitted: ((name?: string) => wrapper.emitted(name!)) as never,
    rerender: async (props) => {
      await wrapper.setProps(props as never)
      await mark(renderResult.locator, 'nuxt.rerender', renderResult.rerender)
    },
    ...getElementLocatorSelectors(container),
  }

  return renderResult
}

export function cleanup(): void {
  mountedWrappers.forEach((wrapper) => {
    wrapper.unmount()
    mountedWrappers.delete(wrapper)
  })
}

async function mark(locator: Locator, name: string, fn: (...args: never[]) => unknown) {
  if (!locator.mark) {
    return
  }

  const error = new Error(name)
  if ('captureStackTrace' in Error) {
    Error.captureStackTrace(error, fn)
  }

  return locator.mark(name, error)
}

function unwrapNode(node: Element | null) {
  if (node && typeof node.replaceWith === 'function') {
    node.replaceWith(...node.childNodes)
  }
}

async function mountWrapperSuspended<T>(
  component: T,
  options: WrapperOptions<T> = {},
) {
  const wrapperOptions = { ...options }

  cleanupAll()

  let container!: HTMLElement
  let baseElement!: HTMLElement
  let createdContainer: HTMLElement | undefined

  const { wrapper, setProps } = await wrapperSuspended(component, wrapperOptions, {
    wrapperFn,
    overrideOptionsFn(options, vueApp) {
      baseElement = options.baseElement || document.body
      if (options.container) {
        container = options.container
      }
      else if (baseElement.contains(vueApp._container)) {
        container = vueApp._container as HTMLElement
      }
      else {
        container = baseElement.appendChild(document.createElement('div'))
        createdContainer = container
      }
      options.attachTo = container
    },
    suspendedHelperName: 'BrowserSuspendedHelper',
    clonedComponentName: 'BrowserSuspendedComponent',
    stubRouterLink: false,
  })

  Object.assign(wrapper, { __setProps: setProps })

  const _unmount = wrapper.unmount.bind(wrapper)
  wrapper.unmount = () => {
    _unmount()
    createdContainer?.remove()
  }

  mountedWrappers.add(wrapper)
  unwrapNode(wrapper.element.parentElement)

  return {
    container,
    baseElement,
    wrapper,
    setProps,
  }
}
