import { describe, it, expect } from 'vitest'

import { mountSuspended, registerEndpoint } from 'vitest-environment-nuxt/utils'

import App from '~/app.vue'
import FetchComponent from '~/components/FetchComponent.vue'
import OptionsComponent from '~/components/OptionsComponent.vue'

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
        "slug": "foo",
      }
    `)
    // TODO: should it be possible to push to other routes?
  })

  it('allows pushing to other pages', async () => {
    await useRouter().push('/something')
    expect(useRoute().fullPath).toMatchInlineSnapshot('"/something"')
  })
})

describe('test utils', () => {
  it('can mount components within nuxt suspense', async () => {
    const component = await mountSuspended(App)
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>This is an auto-imported component</div>
      <div> I am a global component </div>
      <div>Index page</div>
      <a href=\\"/test\\"> Test link </a>"
    `)
  })

  it('should render default props within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent)
    expect(component.find('h2').html()).toMatchInlineSnapshot(
      '"<h2>The original</h2>"'
    )
  })

  it('should render passed props within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent, {
      props: {
        title: 'title from mount suspense props',
      },
    })
    expect(component.find('h2').html()).toMatchInlineSnapshot(
      '"<h2>title from mount suspense props</h2>"'
    )
  })

  it('can pass slots to mounted components within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent, {
      slots: {
        default: () => 'slot from mount suspense',
      },
    })
    expect(component.find('div').html()).toMatchInlineSnapshot(
      '"<div>slot from mount suspense</div>"'
    )
  })

  it('can mock fetch requests', async () => {
    registerEndpoint('https://jsonplaceholder.typicode.com/todos/1', () => ({
      title: 'title from mocked api',
    }))
    const component = await mountSuspended(FetchComponent)
    expect(component.html()).toMatchInlineSnapshot(
      '"<div>title from mocked api</div>"'
    )
  })

  it('handles nuxt routing', async () => {
    const component = await mountSuspended(App, { route: '/test' })
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>This is an auto-imported component</div>
      <div> I am a global component </div>
      <div>/</div>
      <a href=\\"/test\\"> Test link </a>"
    `)
  })
})
