import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { runA11yScan } from '@nuxt/a11y/test-utils'

import MyComponent from '~/components/MyComponent.vue'

function wrapInDocument(fragment: string): string {
  return `<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body><main>${fragment}</main></body></html>`
}

it('MyComponent has no a11y violations', async () => {
  const wrapper = await mountSuspended(MyComponent, {
    props: { title: 'Hello' },
  })
  const result = await runA11yScan(wrapInDocument(wrapper.html()))
  expect(result).toHaveNoA11yViolations()
})

it('detects missing button label', async () => {
  const result = await runA11yScan(wrapInDocument('<button></button>'))
  expect(result.violationCount).toBeGreaterThan(0)
  expect(result.getByRule('button-name')).toHaveLength(1)
})
