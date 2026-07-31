import { describe, expect, it } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'

import MyComponent from '../../app/components/MyComponent.vue'

describe('nitro vite environment', () => {
  it('can access the nuxt app', () => {
    expect(Object.keys(useAppConfig())).toContain('nuxt')
  })

  it('can mount components', async () => {
    const component = await mountSuspended(MyComponent, { props: { title: 'My title' } })
    expect(component.text()).toBe('My title')
  })

  it('can mock server routes', async () => {
    registerEndpoint('/api/echo', () => ({ hello: 'world' }))
    expect(await $fetch('/api/echo')).toStrictEqual({ hello: 'world' })
  })
})
