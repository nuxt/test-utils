import { describe, it, expect, vi, beforeEach } from 'vitest'
import { page } from 'vitest/browser'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { MyCounter, MyHello } from '#components'

mockNuxtImport(useCounter, vi.fn)
mockNuxtImport(useHelloApi, vi.fn)

describe('Mock Nuxt Import', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  it('useCounter', async () => {
    const decrement = vi.fn()

    vi.mocked(useCounter).mockImplementation(() => ({
      count: ref(100),
      increment: vi.fn(),
      decrement,
    }))

    const screen = await page.render(MyCounter)
    await expect.element(screen.getByText('Count: 100')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: 'Decrement' })
    await expect.element(button).toBeInTheDocument()
    await button.click()

    expect(decrement).toHaveBeenCalledOnce()
  })

  it('useHelloApi', async () => {
    vi.mocked(useHelloApi).mockImplementation(() => ({
      data: ref({ message: '(Mocked)' }),
      pending: ref(false),
    }))

    const screen = await page.render(MyHello)
    const message = screen.getByRole('textbox', { name: 'Message' })
    await expect.element(message).toBeInTheDocument()
    await expect.element(message).toHaveValue('(Mocked)')
  })
})
