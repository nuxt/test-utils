import type { Locator, LocatorSelectors, PrettyDOMOptions } from 'vitest/browser'
import { page, server, utils } from 'vitest/browser'
import { mount as wrapperFn } from '@vue/test-utils'

import type { SetupState, WrapperSuspendedOptions } from '../runtime-utils/utils/suspended.ts'
import { cleanupAll, patchWrapperSetProps, resolveVueApp, wrapperSuspended } from '../runtime-utils/utils/suspended.ts'

export { config } from '@vue/test-utils'

type ComponentProps<T> = T extends new (...args: never[]) => {
  $props: infer P
} ? NonNullable<P> : T extends (props: infer P, ...args: never[]) => unknown ? P : object

type WrapperFn<C> = typeof wrapperFn<C>
type WrapperOptions<C> = Omit<WrapperSuspendedOptions<WrapperFn<C>>, 'attachTo'> & {
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
  /**
   * The return value of the component setup, mocked when the `spy` option is enabled.
   */
  setupState: SetupState
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
 * import { render } from '@nuxt/test-utils/browser'
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
    get setupState() {
      return wrapper.setupState
    },
    debug: (el = container, maxLength, options) => debug(el, maxLength, options),
    unmount: async () => {
      wrapper.unmount()
      mountedWrappers.delete(wrapper)
      await mark(renderResult.locator, 'nuxt.unmount', renderResult.unmount)
    },
    emitted: ((eventName?: string) => wrapper.emitted(eventName as string)) as RenderResult<ComponentProps<T>>['emitted'],
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
  cleanupAll()
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

/**
 * `@vue/test-utils` mounts into a `div` of its own inside `attachTo`. Removing that div keeps the
 * rendered markup a direct child of the container, so locators and snapshots see the component's
 * own DOM.
 */
function unwrapNode(node: Element | null) {
  if (node && typeof node.replaceWith === 'function') {
    node.replaceWith(...node.childNodes)
  }
}

async function mountWrapperSuspended<T>(
  component: T,
  options: WrapperOptions<T> = {},
) {
  const { container: containerOption, baseElement: baseElementOption, ...wrapperOptions } = options

  cleanupAll()

  const vueApp = resolveVueApp()
  const baseElement = baseElementOption || document.body

  let container: HTMLElement
  let createdContainer: HTMLElement | undefined

  if (containerOption) {
    container = containerOption
  }
  else if (baseElement.contains(vueApp._container as Node)) {
    container = vueApp._container as HTMLElement
  }
  else {
    container = baseElement.appendChild(document.createElement('div'))
    createdContainer = container
  }

  const suspendedOptions: WrapperSuspendedOptions<WrapperFn<T>> = { ...wrapperOptions, attachTo: container }

  const { wrapper, setProps } = await wrapperSuspended(component, suspendedOptions, {
    wrapperFn,
    suspendedHelperName: 'BrowserSuspendedHelper',
    clonedComponentName: 'BrowserSuspendedComponent',
    stubRouterLink: false,
  })

  patchWrapperSetProps(wrapper, setProps)

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
  }
}
