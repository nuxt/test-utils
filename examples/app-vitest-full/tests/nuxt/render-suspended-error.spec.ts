import { afterEach, describe, expect, it, vi } from 'vitest'

import { Suspense } from 'vue'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { NuxtErrorBoundary } from '#components'

function testWrapHtml(html: string) {
  return [
    '<div id="test-wrapper">',
    ...html.split('\n').map(s => `  ${s}`),
    '</div>',
  ].join('\n')
}

describe('renderSuspended handle error', () => {
  afterEach(() => {
    // since we're not running with Vitest globals when running the tests
    // from inside the test server. This means testing-library cannot
    // auto-attach the cleanup go testing globals, and we have to do
    // it here manually.
    if (process.env.NUXT_VITEST_DEV_TEST) {
      cleanup()
    }
  })

  describe('@testing-library/vue compatibility', () => {
    it('throws on mounted', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        mounted() {
          throw new Error('thrown')
        },
      })

      expect(() => render(TestComponent)).toThrow('thrown')
      await expect(() => renderSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('child throws on mounted', async () => {
      const ChildComponent = defineComponent({
        template: '<div></div>',
        mounted() {
          throw new Error('thrown')
        },
      })

      const TestComponent = defineComponent({
        render() {
          return h('div', [h(ChildComponent)])
        },
      })

      expect(() => render(TestComponent)).toThrow('thrown')
      await expect(() => renderSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('throws on setup', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        setup() {
          throw new Error('thrown')
        },
      })

      expect(() => render(TestComponent)).toThrow('thrown')
      await expect(() => renderSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('child throws on setup', async () => {
      const ChildComponent = defineComponent({
        template: '<div></div>',
        setup() {
          throw new Error('thrown')
        },
      })

      const TestComponent = defineComponent({
        render() {
          return h('div', [h(ChildComponent)])
        },
      })

      expect(() => render(TestComponent)).toThrow('thrown')
      await expect(() => renderSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('onErrorCaptured throws on setup', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        setup() {
          onErrorCaptured(() => false)
          throw new Error('thrown')
        },
      })

      expect(() => render(TestComponent)).toThrow('thrown')
      await expect(() => renderSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('onErrorCaptured child throws on setup', async () => {
      const ChildComponent = defineComponent({
        template: '<div>hello</div>',
        setup() {
          throw new Error('thrown')
        },
      })

      const TestComponent = defineComponent({
        setup() {
          onErrorCaptured(() => false)
        },
        render() {
          return h('div', [h(ChildComponent)])
        },
      })

      const vWrapper = render(TestComponent)
      const nWrapper = await renderSuspended(TestComponent)

      expect(nWrapper.html()).toBe(testWrapHtml(vWrapper.html()))
    })

    it('global errorHandler handle throws on setup', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        setup() {
          throw 'thrown'
        },
      })

      const errorHandler = vi.fn()

      expect(
        () => render(TestComponent, { global: { config: { errorHandler } } }),
      ).toThrow('thrown')
      expect(errorHandler).toHaveBeenNthCalledWith(1, 'thrown', expect.anything(), expect.anything())

      await expect(
        () => renderSuspended(TestComponent, { global: { config: { errorHandler } } }),
      ).rejects.toThrow('thrown')
      expect(errorHandler).toHaveBeenNthCalledWith(2, 'thrown', expect.anything(), expect.anything())
    })

    it('global errorHandler throws', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        setup() {
          throw 'thrown'
        },
      })

      const errorHandler = () => {
        throw 'error global errorHandler'
      }

      expect(
        () => render(TestComponent, { global: { config: { errorHandler } } }),
      ).toThrow('error global errorHandler')

      await expect(
        () => renderSuspended(TestComponent, { global: { config: { errorHandler } } }),
      ).rejects.toThrow('error global errorHandler')
    })

    it('global errorHandler handle throws on after mounted ', async () => {
      const TestComponent = defineComponent({
        setup() {
          const onClick = () => {
            throw 'thrown'
          }
          return () => h('button', { onClick })
        },
      })

      const errorHandler = vi.fn()

      const vWrapper = render(TestComponent, { global: { config: { errorHandler } } })
      await fireEvent.click(vWrapper.getByRole('button'))
      expect(errorHandler).toHaveBeenNthCalledWith(1, 'thrown', expect.anything(), expect.anything())

      cleanup()

      const nWrapper = await renderSuspended(TestComponent, { global: { config: { errorHandler } } })
      await fireEvent.click(nWrapper.getByRole('button'))
      expect(errorHandler).toHaveBeenNthCalledWith(2, 'thrown', expect.anything(), expect.anything())
    })
  })

  describe('nuxt/test-utils', () => {
    it('throws on async setup', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        async setup() {
          throw new Error('thrown')
        },
      })

      await expect(() => renderSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('child throws on async setup', async () => {
      const ChildComponent = defineComponent({
        template: '<div></div>',
        async setup() {
          throw new Error('thrown')
        },
      })

      const TestComponent = defineComponent({
        render() {
          return h('div', [h(ChildComponent)])
        },
      })

      await expect(() => renderSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('onErrorCaptured child throws on async setup', async () => {
      const ChildComponent = defineComponent({
        template: '<div>hello</div>',
        async setup() {
          throw new Error('thrown')
        },
      })

      const TestComponent = defineComponent({
        setup() {
          onErrorCaptured(() => false)
        },
        render() {
          return h('div', [h(ChildComponent)])
        },
      })

      expect((await renderSuspended(TestComponent)).container.textContent).toBe('hello')
    })

    it('global errorHandler handle throws on async setup', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        async setup() {
          throw 'thrown'
        },
      })

      const errorHandler = vi.fn()

      await expect(
        () => renderSuspended(TestComponent, { global: { config: { errorHandler } } }),
      ).rejects.toThrow('thrown')
      expect(errorHandler).toHaveBeenNthCalledWith(1, 'thrown', expect.anything(), expect.anything())
    })

    it('global errorHandler handle throws on after async setup ', async () => {
      const TestComponent = defineComponent({
        async setup() {
          const onClick = () => {
            throw 'thrown'
          }
          return () => h('button', { onClick })
        },
      })

      const errorHandler = vi.fn()

      const nWrapper = await renderSuspended(TestComponent, { global: { config: { errorHandler } } })
      await fireEvent.click(nWrapper.getByRole('button'))
      expect(errorHandler).toHaveBeenNthCalledWith(1, 'thrown', expect.anything(), expect.anything())
    })

    it('NuxtErrorBoundary handle throws on setup', async () => {
      const ChildComponent = defineComponent({
        template: '<div></div>',
        setup() {
          throw createError({ message: 'thrown', fatal: true })
        },
      })

      const TestComponent = defineComponent({
        render() {
          return h(NuxtErrorBoundary, null, {
            default: () => h(ChildComponent),
            error: () => h('div', 'error'),
          })
        },
      })

      expect((await renderSuspended(TestComponent)).container.textContent).toBe('error')
    })

    it('NuxtErrorBoundary/Suspense wrappedInstance throws on async setup', async () => {
      const ChildComponent = defineComponent({
        template: '<div></div>',
        async setup() {
          throw createError({ message: 'thrown', fatal: true })
        },
      })

      const TestComponent = defineComponent({
        render() {
          return h(NuxtErrorBoundary, null, {
            default: () => h(Suspense, [h(ChildComponent)]),
            error: () => h('div', 'error'),
          })
        },
      })

      expect((await renderSuspended(TestComponent)).container.textContent).toBe('error')
    })
  })
})
