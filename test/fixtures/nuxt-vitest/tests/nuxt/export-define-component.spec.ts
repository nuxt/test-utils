import { expect, it } from 'vitest'
import { mountSuspended } from 'vitest-environment-nuxt/utils'
import ExportDefaultComponent from '~/components/ExportDefaultComponent.vue'
import ExportDefineComponent from '~/components/ExportDefineComponent.vue'
import ExportDefaultWithRenderComponent from '~/components/ExportDefaultWithRenderComponent.vue'
import ExportDefaultReturnsRenderComponent from '~/components/ExportDefaultReturnsRenderComponent.vue'

it('should support export default defineComponent', async () => {
  const component = await mountSuspended(ExportDefineComponent, {
    props: {
      myProp: 'Hello nuxt-vitest',
    },
  })
  expect(component.html()).toMatchInlineSnapshot(`
    "<div>
      <h1>ExportDefineComponent</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre>
    </div>"
  `)
})

it('should support export default without setup script', async () => {
  const component = await mountSuspended(ExportDefaultComponent, {
    props: {
      myProp: 'Hello nuxt-vitest',
    },
  })
  expect(component.html()).toMatchInlineSnapshot(`
    "<div>
      <h1>ExportDefaultComponent</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre>
    </div>"
  `)
})

it('should support export default with render function', async () => {
  const component = await mountSuspended(ExportDefaultWithRenderComponent, {
    props: {
      myProp: 'Hello nuxt-vitest',
    },
  })
  expect(component.html()).toMatchInlineSnapshot(`
    "<div>
      <h1>ExportDefaultWithRenderComponent</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre>
    </div>"
  `)
})

it('should support export default that returns render function', async () => {
  const component = await mountSuspended(ExportDefaultReturnsRenderComponent, {
    props: {
      myProp: 'Hello nuxt-vitest',
    },
  })
  expect(component.html()).toMatchInlineSnapshot(`
    "<div>
      <h1>ExportDefaultReturnsRenderComponent</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre>
    </div>"
  `)
})
