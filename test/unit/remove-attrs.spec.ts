import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { removeAttrsNodeTransform } from '../../src/module/plugins/remove-attrs.ts'

async function render(component: Component, attrs = ['data-testid']) {
  const app = createSSRApp(component)
  Object.assign(app.config.compilerOptions, {
    whitespace: 'condense',
    cacheKey: crypto.randomUUID(),
    nodeTransforms: [removeAttrsNodeTransform(attrs)],
  })
  return await renderToString(app)
}

describe(removeAttrsNodeTransform, () => {
  it.each<[string, string]>([
    ['static attribute', `<div data-testid="foo" class="bar">hello</div>`],
    ['static attribute (mixed case)', `<div data-testId="foo" class="bar">hello</div>`],
    ['attribute without a value', `<div data-testid class="bar">hello</div>`],
    ['v-bind shorthand', `<div :data-testid="'foo'" class="bar">hello</div>`],
    ['v-bind shorthand (mixed case)', `<div :data-testId="'foo'" class="bar">hello</div>`],
    ['v-bind', `<div v-bind:data-testid="'foo'" class="bar">hello</div>`],
    ['same-name shorthand', `<div :data-testid class="bar">hello</div>`],
    ['same-name shorthand (mixed case)', `<div :data-testId class="bar">hello</div>`],
    ['duplicated static and dynamic attributes', `<div data-testid="foo" class="bar" :data-testid="'foo'">hello</div>`],
  ])('removes data-testid: %s', async (_, template) => {
    const html = await render({
      setup: () => ({ dataTestId: 'foo' }),
      template,
    })
    expect(html).toBe(`<div class="bar">hello</div>`)
  })

  it.each<[string[], string]>([
    [['data-test-id'], `<div data-test-id="foo" class="bar" :data-test-id="'foo'">hello</div>`],
    [['data-test'], `<div data-test="foo" class="bar" :data-test="'foo'">hello</div>`],
    [['data-test', 'data-test-id'], `<div data-test-id="foo" class="bar" :data-test="'foo'">hello</div>`],
  ])('removes %o in component template', async (attrs, template) => {
    const html = await render({ template }, attrs)
    expect(html).toBe(`<div class="bar">hello</div>`)
  })

  it('removes data-testid in a child component template', async () => {
    const html = await render({
      template: `<TestButton testid="foo" />`,
      components: {
        TestButton: defineComponent({
          props: ['testid'],
          template: `<button :data-test-id="testid" :data-testid="testid">Test</button>`,
        }),
      },
    })
    expect(html).toBe(`<button data-test-id="foo">Test</button>`)
  })

  it('removes data-testid passed to a component (fallthrough attribute)', async () => {
    const html = await render({
      template: `<TestButton data-testid="foo" :data-testid="'bar'" class="baz" />`,
      components: {
        TestButton: defineComponent({
          template: `<button>Test</button>`,
        }),
      },
    })
    expect(html).toBe(`<button class="baz">Test</button>`)
  })

  it('keeps similarly named attributes', async () => {
    const html = await render({
      template: `<div data-test-id="foo" data-testid-foo="bar" aria-label="baz" data-testid="qux">hello</div>`,
    })
    expect(html).toBe(`<div data-test-id="foo" data-testid-foo="bar" aria-label="baz">hello</div>`)
  })

  it('keeps v-bind object and dynamic argument bindings', async () => {
    const html = await render({
      setup: () => ({ attrName: 'title' }),
      template: `<div v-bind="{ id: 'foo' }" :[attrName]="'bar'" data-testid="baz">hello</div>`,
    })
    expect(html).toBe(`<div id="foo" title="bar">hello</div>`)
  })

  it('removes data-testid in v-for elements', async () => {
    const html = await render({
      setup: () => ({ items: [1, 2] }),
      template: `\
      <ul>
        <li v-for="i in items" :key="i" :data-testid="'item-' + i">
          {{ i }}
        </li>
      </ul>`,
    })
    expect(html).toContain(`<li>1</li><li>2</li>`)
    expect(html).not.toContain(`data-testid`)
  })

  it('removes data-testid inside <template> and slots', async () => {
    const html = await render({
      template: `\
      <TestWrapper>
        <template #default>
          <span data-testid="foo1">hello</span>
        </template>
      </TestWrapper>`,
      components: {
        TestWrapper: defineComponent({
          template: `<div data-testid="foo2"><slot /></div>`,
        }),
      },
    })
    expect(html).toContain(`<span>hello</span>`)
    expect(html).not.toContain(`data-testid`)
  })

  it('keeps <slot> outlet props', async () => {
    const html = await render({
      template: `\
      <TestWrapper v-slot="slotProps">
        <span v-bind="slotProps">hello</span>
      </TestWrapper>`,
      components: {
        TestWrapper: defineComponent({
          template: `<div><slot :data-testid="'foo'" id="baz" /></div>`,
        }),
      },
    })
    expect(html).toContain(`<span datatestid="foo" id="baz">hello</span>`)
  })

  it('removes data-testid bound from <slot> outlet props', async () => {
    const html = await render({
      template: `\
      <TestWrapper v-slot="{ dataTestid, ...slotProps }">
        <span v-bind="slotProps" :data-testid>hello</span>
      </TestWrapper>`,
      components: {
        TestWrapper: defineComponent({
          template: `<div><slot :data-testid="'foo'" id="baz" /></div>`,
        }),
      },
    })
    expect(html).toContain(`<span id="baz">hello</span>`)
  })
})
