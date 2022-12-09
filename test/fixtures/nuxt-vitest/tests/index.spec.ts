import { describe, it, expect } from 'vitest'

import { mountSuspended } from '../../src/runtime/mount'
import { registerEndpoint } from '../../src/runtime/mock'

import App from '~/app.vue'
import FetchComponent from '~/components/FetchComponent.vue'

describe('client-side nuxt features', () => {
  it('can use core nuxt composables within test file', () => {
    expect(useAppConfig().hey).toMatchInlineSnapshot('false')
  })

  it('can access auto-imported composables from within project', () => {
    const state = useSingleState()
    expect(state.value).toMatchInlineSnapshot('{}')
    state.value.field = 'new value'
    expect(state.value.field).toMatchInlineSnapshot('"new value"')
    expect(useSingleState().value.field).toMatchInlineSnapshot('"new value"')
  })

  it('can access injections from nuxt plugins', () => {
    const app = useNuxtApp()
    expect(app.$auth.didInject).toMatchInlineSnapshot('true')
    expect(app.$router).toBeDefined()
  })

  it('defaults to index page', async () => {
    expect(useRoute().matched[0].meta).toMatchInlineSnapshot(`
    {
      "value": "set in index",
    }
  `)
    expect(useRoute().fullPath).toMatchInlineSnapshot('"/"')
    // TODO: should it be possible to push to other routes?
  })
})

describe('test utils', () => {
  it('can mount components within nuxt suspense', async () => {
    const component = await mountSuspended(App)
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>This is an auto-imported component</div>
      <!-- TODO: <NuxtPage /> -->
      <a href=\\"/test\\">Test link</a>"
    `)
  })

  it('can mock fetch requests', async () => {
    registerEndpoint('https://jsonplaceholder.typicode.com/todos/1', () => ({
      title: 'title from mocked api',
    }))
    const component = await mountSuspended(FetchComponent)
    expect(component.html()).toMatchInlineSnapshot('"<div>title from mocked api</div>"')
  })

  // TODO: make working with router - currently router components are not
  // registered and route symbol is not injected
  it.todo('handles nuxt routing')
})
