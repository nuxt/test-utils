import { afterEach, describe, it, expect } from 'vitest'
import { renderSuspended } from 'vitest-environment-nuxt/utils'
import { cleanup, fireEvent, screen } from '@testing-library/vue'

import App from '~/app.vue'
import OptionsComponent from '~/components/OptionsComponent.vue'
import WrapperTests from '~/components/WrapperTests.vue'

describe('test utils', () => {
  describe('renderSuspended', () => {
    afterEach(() => {
      // since we're not running with Vitest globals when running the tests
      // from inside the test server. This means testing-library cannot
      // auto-attach the cleanup go testing globals, and we have to do
      // it here manually.
      if (process.env.NUXT_VITEST_DEV_TEST) {
        cleanup()
      }
    })

    it('can render components within nuxt suspense', async () => {
      const { html } = await renderSuspended(App)
      expect(html()).toMatchInlineSnapshot(`
        "<div id=\\"test-wrapper\\">
          <div>This is an auto-imported component</div>
          <div> I am a global component </div>
          <div>Index page</div><a href=\\"/test\\"> Test link </a>
        </div>"
      `)
    })

    it('should render default props within nuxt suspense', async () => {
      await renderSuspended(OptionsComponent)
      expect(screen.getByRole('heading', { level: 2 })).toMatchInlineSnapshot(
        `
        <h2>
          The original
        </h2>
      `
      )
    })

    it('should render passed props within nuxt suspense', async () => {
      await renderSuspended(OptionsComponent, {
        props: {
          title: 'title from mount suspense props',
        },
      })
      expect(screen.getByRole('heading', { level: 2 })).toMatchInlineSnapshot(
        `
        <h2>
          title from mount suspense props
        </h2>
      `
      )
    })

    it('can pass slots to rendered components within nuxt suspense', async () => {
      const text = 'slot from mount suspense'
      await renderSuspended(OptionsComponent, {
        slots: {
          default: () => text,
        },
      })
      expect(screen.getByText(text)).toBeDefined()
    })

    it('can receive emitted events from components rendered within nuxt suspense', async () => {
      const { emitted } = await renderSuspended(WrapperTests)
      const button = screen.getByRole('button', { name: 'Click me!' })
      await fireEvent.click(button)

      const emittedEvents = emitted()
      expect(emittedEvents.click).toMatchObject(
        expect.arrayContaining([
          expect.arrayContaining([expect.objectContaining({ type: 'click' })]),
        ])
      )

      // since this is a native event it doesn't serialize well
      delete emittedEvents.click
      expect(emittedEvents).toMatchInlineSnapshot(`
        {
          "customEvent": [
            [
              "foo",
            ],
          ],
          "otherEvent": [
            [],
          ],
        }
      `)
    })
  })
})
