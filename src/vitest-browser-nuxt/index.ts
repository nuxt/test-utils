import { page } from 'vitest/browser'
import { beforeEach } from 'vitest'
import { cleanup, render } from './pure.ts'

export { render, cleanup, config } from './pure.ts'

page.extend({
  render,
  [Symbol.for('vitest:component-cleanup')]: cleanup,
})

beforeEach(() => {
  cleanup()
})

declare module 'vitest/browser' {
  interface BrowserPage {
    render: typeof render
  }
}
