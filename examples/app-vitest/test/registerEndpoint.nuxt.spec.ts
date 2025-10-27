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
})
