import { h, nextTick } from 'vue'
import { cleanupAll, wrapperSuspended } from './utils/suspended'
import type { WrapperSuspendedOptions, WrapperSuspendedResult } from './utils/suspended'

import type { render } from '@testing-library/vue'

type WrapperFn<C> = typeof render<C>
type WrapperOptions<C> = WrapperSuspendedOptions<WrapperFn<C>>
type WrapperResult<C> = WrapperSuspendedResult<WrapperFn<C>>

/**
 * `renderSuspended` allows you to mount any vue component within the Nuxt environment, allowing async setup and access to injections from your Nuxt plugins.
 *
 * This is a wrapper around the `render` function from @testing-libary/vue, and should be used together with
 * utilities from that package.
 *
 * ```ts
 * // tests/components/SomeComponents.nuxt.spec.ts
 * import { renderSuspended } from '@nuxt/test-utils/runtime'
 *
 * it('can render some component', async () => {
 * const { html } = await renderSuspended(SomeComponent)
 * expect(html()).toMatchInlineSnapshot(
 * 'This is an auto-imported component'
 * )
 *
 * })
 *
 * // tests/App.nuxt.spec.ts
 * import { renderSuspended } from '@nuxt/test-utils/runtime'
 * import { screen } from '@testing-library/vue'
 *
 * it('can also mount an app', async () => {
 * const { html } = await renderSuspended(App, { route: '/test' })
 * expect(screen.getByRole('link', { name: 'Test Link' })).toBeVisible()
 * })
 * ```
 * @param component the component to be tested
 * @param options optional options to set up your component
 */
export async function renderSuspended<T>(
  component: T,
  options: WrapperOptions<T> = {},
): Promise<WrapperResult<T>> {
  const wrapperId = 'test-wrapper'
  const suspendedHelperName = 'RenderHelper'
  const clonedComponentName = 'RenderSuspendedComponent'

  const { render: wrapperFn } = await import('@testing-library/vue')

  cleanupAll()
  document.getElementById(wrapperId)?.remove()

  const { wrapper, setProps } = await wrapperSuspended(component, options, {
    wrapperFn,
    wrappedRender: render => () => h({
      inheritAttrs: false,
      render: () => h('div', { id: wrapperId }, render()),
    }),
    suspendedHelperName,
    clonedComponentName,
  })

  wrapper.rerender = async (props) => {
    setProps(props)
    await nextTick()
  }

  return wrapper
}
