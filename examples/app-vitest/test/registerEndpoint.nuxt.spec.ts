import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { it, expect, vi, describe } from 'vitest'
import TestFetchComponent from '../components/TestFetchComponent.vue'

describe('registerEndpoint tests', () => {
  it('/test1/ called WITHOUT onRequest intercepted', async () => {
    const endpoint = vi.fn(() => '')
    registerEndpoint('/test1/', () => endpoint())
    const component = await mountSuspended(TestFetchComponent)

    component
      .find<HTMLButtonElement>('#normal-fetcher')
      .element.click()

    expect(endpoint).toHaveBeenCalled()
    component.unmount()
  })

  it('/test2/ called WITH onRequest intercepted', async () => {
    const endpoint = vi.fn(() => '')
    registerEndpoint('/test2/', () => endpoint())
    const component = await mountSuspended(TestFetchComponent)

    await component
      .find<HTMLButtonElement>('#custom-fetcher')
      .trigger('click')

    expect(endpoint).toHaveBeenCalled()
    component.unmount()
  })

  describe('once option', () => {
    it('should handle the endpoint only once', async () => {
      const endpoint = vi.fn(() => ({ name: 'Alice' }))
      registerEndpoint('/test-once/', {
        handler: () => endpoint(),
        once: true,
      })

      const component = await mountSuspended(TestFetchComponent)

      await component.find<HTMLButtonElement>('#once-fetcher').trigger('click')
      expect(endpoint).toHaveBeenCalledTimes(1)

      await component.find<HTMLButtonElement>('#once-fetcher').trigger('click')
      expect(endpoint).toHaveBeenCalledTimes(1)

      component.unmount()
    })

    it('should allow re-registering endpoint after once is consumed', async () => {
      const endpoint1 = vi.fn(() => ({ name: 'Bob' }))
      registerEndpoint('/test-once-reregister/', {
        handler: () => endpoint1(),
        once: true,
      })

      const component = await mountSuspended(TestFetchComponent)

      await component.find<HTMLButtonElement>('#once-reregister-fetcher').trigger('click')
      expect(endpoint1).toHaveBeenCalledTimes(1)

      // Re-register with different handler
      const endpoint2 = vi.fn(() => ({ name: 'Charlie' }))
      registerEndpoint('/test-once-reregister/', {
        handler: () => endpoint2(),
        once: true,
      })

      await component.find<HTMLButtonElement>('#once-reregister-fetcher').trigger('click')
      expect(endpoint2).toHaveBeenCalledTimes(1)

      component.unmount()
    })
  })
})
