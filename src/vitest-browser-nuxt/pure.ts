import { h, nextTick } from 'vue'
import { render as wrapperFn } from 'vitest-browser-vue/pure'

import type { WrapperSuspendedOptions, WrapperSuspendedResult } from '../runtime-utils/utils/suspended.ts'
import { cleanupAll, wrapperSuspended } from '../runtime-utils/utils/suspended.ts'

export { config, cleanup } from 'vitest-browser-vue/pure'

type WrapperFn<C> = typeof wrapperFn<C>
type WrapperOptions<C> = WrapperSuspendedOptions<WrapperFn<C>>
type WrapperResult<C> = WrapperSuspendedResult<WrapperFn<C>>

/**
 * `render` allows you to mount any vue component within the vitest browser mode.
 *
 * This is a wrapper around the `render` function from vitest-browser-vue, and should be used together with
 * utilities from that package.
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
): Promise<WrapperResult<T>> {
  const suspendedHelperName = 'RenderBrowserHelper'
  const clonedComponentName = 'RenderBrowserSuspendedComponent'

  cleanupAll()

  const umountedFns: (() => void)[] = []
  const wrapperId = window.crypto.randomUUID()

  const { wrapper: _wrapper, setProps } = await wrapperSuspended(component, options, {
    wrapperFn,
    wrappedRender: render => () => h({
      inheritAttrs: false,
      unmounted: () => umountedFns.forEach(fn => fn()),
      render: () => h('div', { id: wrapperId }, render()),
    }),
    overrideOptionsFn(options, vueApp) {
      if (vueApp._container instanceof HTMLElement) {
        options.container ??= vueApp._container
      }
    },
    suspendedHelperName,
    clonedComponentName,
    stubRouterLink: false,
  })

  // The render result is wrapped in a PromiseLike object. Unwrap it to override.
  const wrapper = await _wrapper
  wrapper.rerender = async (props) => {
    setProps(props)
    await nextTick()
  }

  // Unwrap render wrapper div element
  const wrapperEl = document.getElementById(wrapperId)!
  const unwrappedNodes = [...wrapperEl.childNodes]
  wrapperEl.replaceWith(...unwrappedNodes)

  umountedFns.push(() => unwrappedNodes.forEach(c => c.remove()))

  return wrapper
}
