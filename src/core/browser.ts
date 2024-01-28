import type { Browser, BrowserContextOptions, Page } from 'playwright-core'
import { useTestContext } from './context'
import { url } from './server'

export async function createBrowser () {
  const ctx = useTestContext()

  let playwright: typeof import('playwright-core')
  try {
    playwright = await import(/* vite-ignore */ 'playwright-core')
  } catch {
    /* istanbul ignore next */
    throw new Error(`
      The dependency 'playwright-core' not found.
      Please run 'yarn add --dev playwright-core' or 'npm install --save-dev playwright-core'
    `)
  }

  const { type, launch } = ctx.options.browserOptions
  if (!playwright[type]) {
    throw new Error(`Invalid browser '${type}'`)
  }

  ctx.browser = await playwright[type].launch(launch)
}

export async function getBrowser (): Promise<Browser> {
  const ctx = useTestContext()
  if (!ctx.browser) {
    await createBrowser()
  }
  return ctx.browser!
}

type _GotoOptions = NonNullable<Parameters<Page['goto']>[1]>
interface GotoOptions extends Omit<_GotoOptions, 'waitUntil'> {
  waitUntil?: 'hydration' | 'route' | _GotoOptions['waitUntil']
}

interface NuxtPage extends Omit<Page, 'goto'> {
  goto: (url: string, options?: GotoOptions) => Promise<void>
}

export async function createPage (path?: string, options?: BrowserContextOptions): Promise<NuxtPage> {
  const browser = await getBrowser()
  const page = await browser.newPage(options) as unknown as NuxtPage

  const _goto = page.goto.bind(page)
  page.goto = async (url, options) => {
    const waitUntil = options?.waitUntil
    if (waitUntil && ['hydration', 'route'].includes(waitUntil)) {
      delete options.waitUntil
    }
    const res = await _goto(url, options)
    if (waitUntil === 'hydration') {
      await page.waitForFunction(() => window.useNuxtApp?.().isHydrating === false)
    } else if (waitUntil === 'route') {
      await page.waitForFunction((route) => window.useNuxtApp?.()._route.fullPath === route, path)
    }
    return res
  }

  if (path) {
    await page.goto(url(path), { waitUntil: 'hydration' })
  }

  return page
}
