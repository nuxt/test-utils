import { describe, expect, it, vi } from 'vitest'

import { Suspense } from 'vue'
import { mount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { NuxtErrorBoundary } from '#components'

describe('mountSuspended handle error', () => {
  describe('vue/test-utils compatibility', () => {
    it('throws on mounted', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        mounted() {
          throw new Error('thrown')
        },
      })

      expect(() => mount(TestComponent)).toThrow('thrown')
      await expect(() => mountSuspended(TestComponent)).rejects.toThrow('thrown')
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

      expect(() => mount(TestComponent)).toThrow('thrown')
      await expect(() => mountSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('throws on setup', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        setup() {
          throw new Error('thrown')
        },
      })

      expect(() => mount(TestComponent)).toThrow('thrown')
      await expect(() => mountSuspended(TestComponent)).rejects.toThrow('thrown')
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

      expect(() => mount(TestComponent)).toThrow('thrown')
      await expect(() => mountSuspended(TestComponent)).rejects.toThrow('thrown')
    })

    it('onErrorCaptured throws on setup', async () => {
      const TestComponent = defineComponent({
        template: '<div></div>',
        setup() {
          onErrorCaptured(() => false)
          throw new Error('thrown')
        },
      })

      expect(() => mount(TestComponent)).toThrow('thrown')
      await expect(() => mountSuspended(TestComponent)).rejects.toThrow('thrown')
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

      const vWrapper = mount(TestComponent)
      const nWrapper = await mountSuspended(TestComponent)

      expect(nWrapper.text()).toBe(vWrapper.text())
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
        () => mount(TestComponent, { global: { config: { errorHandler } } }),
      ).toThrow('thrown')
      expect(errorHandler).toHaveBeenNthCalledWith(1, 'thrown', expect.anything(), expect.anything())

      await expect(
        () => mountSuspended(TestComponent, { global: { config: { errorHandler } } }),
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
        () => mount(TestComponent, { global: { config: { errorHandler } } }),
      ).toThrow('error global errorHandler')

      await expect(
        () => mountSuspended(TestComponent, { global: { config: { errorHandler } } }),
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

      const vWrapper = mount(TestComponent, { global: { config: { errorHandler } } })
      await vWrapper.find('button').trigger('click')
      expect(errorHandler).toHaveBeenNthCalledWith(1, 'thrown', expect.anything(), expect.anything())

      const nWrapper = await mountSuspended(TestComponent, { global: { config: { errorHandler } } })
      await nWrapper.find('button').trigger('click')
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

      await expect(() => mountSuspended(TestComponent)).rejects.toThrow('thrown')
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

      await expect(() => mountSuspended(TestComponent)).rejects.toThrow('thrown')
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

      expect((await mountSuspended(TestComponent)).text()).toBe('hello')
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
        () => mountSuspended(TestComponent, { global: { config: { errorHandler } } }),
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

      const nWrapper = await mountSuspended(TestComponent, { global: { config: { errorHandler } } })
      await nWrapper.find('button').trigger('click')
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

      expect((await mountSuspended(TestComponent)).text()).toBe('error')
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

      expect((await mountSuspended(TestComponent)).text()).toBe('error')
    })
  })
})
