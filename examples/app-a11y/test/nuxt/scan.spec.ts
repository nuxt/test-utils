import { describe, expect, it } from 'vitest'
import { runA11yScan } from '@nuxt/a11y/test-utils'

function wrapInDocument(fragment: string): string {
  return `<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body>${fragment}</body></html>`
}

describe('server-side a11y scanning', () => {
  it('accessible HTML has no violations', async () => {
    const html = wrapInDocument(`
      <main>
        <h1>Hello</h1>
        <button type="button">Click me</button>
      </main>
    `)
    const result = await runA11yScan(html)
    expect(result).toHaveNoA11yViolations()
  })

  it('detects missing button label', async () => {
    const html = wrapInDocument('<main><button></button></main>')
    const result = await runA11yScan(html)
    expect(result.violationCount).toBeGreaterThan(0)
    expect(result.getByRule('button-name')).toHaveLength(1)
  })

  it('detects missing image alt', async () => {
    const html = wrapInDocument('<main><img src="/test.png"></main>')
    const result = await runA11yScan(html)
    expect(result.getByRule('image-alt')).toHaveLength(1)
  })

  it('filters violations by impact level', async () => {
    const html = wrapInDocument('<main><button></button><img src="/test.png"></main>')
    const result = await runA11yScan(html)
    expect(result).not.toHaveNoA11yViolations()

    const critical = result.getByImpact('critical')
    expect(critical.length).toBeLessThanOrEqual(result.violationCount)
  })

  it('filters violations by tag', async () => {
    const html = wrapInDocument('<main><button></button></main>')
    const result = await runA11yScan(html)
    const wcag2a = result.getByTag('wcag2a')
    expect(wcag2a.length).toBeGreaterThan(0)
  })

  it('color-contrast requires a real browser — server-side scan cannot detect it', async () => {
    const html = wrapInDocument('<main><p style="color: #aaa; background-color: #fff">Low contrast</p></main>')
    const result = await runA11yScan(html)
    expect(result.getByRule('color-contrast')).toHaveLength(0)
  })

  it('matcher supports impact filter', async () => {
    const html = '<!DOCTYPE html><html><head><title>Test</title></head><body><main><p>Hello</p></main></body></html>'
    const result = await runA11yScan(html)
    expect(result).not.toHaveNoA11yViolations()
    expect(result).toHaveNoA11yViolations({ impact: 'critical' })
  })
})
