import type { Locator, LocatorSelectors, PrettyDOMOptions } from 'vitest/browser'
import { page, server, utils } from 'vitest/browser'
import type { VueWrapper } from '@vue/test-utils'
import { mount as wrapperFn } from '@vue/test-utils'

import type { WrapperSuspendedOptions } from '../runtime-utils/utils/suspended.ts'
import { cleanupAll, wrapperSuspended } from '../runtime-utils/utils/suspended.ts'

export { config } from '@vue/test-utils'

type WrapperFn<C> = typeof wrapperFn<C>
type WrapperOptions<C> = WrapperSuspendedOptions<WrapperFn<C>> & {
  container?: HTMLElement
  baseElement?: HTMLElement
}
type ComponentProps<T> = T extends new (...args: never) => {
  $props: infer P
} ? NonNullable<P> : T extends (props: infer P, ...args: never) => unknown ? P : object

export interface RenderResult<Props> extends LocatorSelectors {
  container: HTMLElement
  baseElement: HTMLElement
  locator: Locator
  debug(el?: HTMLElement | HTMLElement[] | Locator | Locator[], maxLength?: number, options?: PrettyDOMOptions): void
  unmount(): Promise<void>
  emitted<T = unknown>(): Record<string, T[]>
  emitted<T = unknown[]>(eventName: string): undefined | T[]
  rerender(props: Partial<Props>): Promise<void>
}

const { debug, getElementLocatorSelectors } = utils

const mountedWrappers = new Set<Pick<VueWrapper, 'unmount'>>()

let idx = 0
function ensureTestIdAttribute(element: HTMLElement) {
  const attributeId = server.config.browser.locators.testIdAttribute
  if (!element.hasAttribute(attributeId)) {
    element.setAttribute(attributeId, `__vitest_${idx++}__`)
  }
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
  const suspendedHelperName = 'RenderBrowserHelper'
  const clonedComponentName = 'RenderBrowserSuspendedComponent'

  cleanupAll()

  if (options.attachTo) {
    throw new Error('`attachTo` is not supported, use `container` instead')
  }

  let container!: HTMLElement
  let baseElement!: HTMLElement

  const { wrapper, setProps } = await wrapperSuspended(component, options, {
    wrapperFn,
    overrideOptionsFn(options, vueApp) {
      container ||= options.container || vueApp._container as HTMLElement
      baseElement ||= options.baseElement || container || document.body
      options.attachTo = container
    },
    suspendedHelperName,
    clonedComponentName,
    stubRouterLink: false,
  })

  Object.assign(wrapper, { __setProps: setProps })

  mountedWrappers.add(wrapper)

  ensureTestIdAttribute(container)
  ensureTestIdAttribute(baseElement)
  unwrapNode(wrapper.element.parentElement)

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

async function mark(locator: Locator, name: string, fn: (...args: never) => unknown) {
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
  if (node) {
    node.replaceWith(...node.childNodes)
  }
}
