import type { Browser, BrowserContextOptions } from 'playwright'
import { getContext } from './context'
import { url as getUrl } from './server'

export async function createBrowser () {
  const ctx = getContext()

  let playwright: typeof import('playwright')
  try {
    playwright = require('playwright')
  } catch {
    /* istanbul ignore next */
    throw new Error(`
      The dependency 'playwright' not found.
      Please run 'yarn add --dev playwright' or 'npm install --save-dev playwright'
    `)
  }

  const { type, launch } = ctx.options.browserOptions
  if (!playwright[type]) {
    throw new Error(`Invalid browser '${type}'`)
  }

  ctx.browser = await playwright[type].launch(launch)
}

export async function getBrowser (): Promise<Browser> {
  const ctx = getContext()
  if (!ctx.browser) {
    await createBrowser()
  }
  return ctx.browser
}

export async function createPage (path?: string, options?: BrowserContextOptions) {
  const browser = await getBrowser()
  const page = await browser.newPage(options)

  if (path) {
    const url = await getUrl(path)
    await page.goto(url)
  }

  return page
}
