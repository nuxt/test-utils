import type { Browser } from 'playwright'
import { getContext } from './context'
import { url } from './server'

export async function createBrowser () {
  const ctx = getContext()

  let playwright: typeof import('playwright')
  try {
    playwright = require('playwright')
  } catch {
    throw new Error(`
        The dependency 'playwright' not found.
        Please run 'yarn add --dev playwright' or 'npm install --save-dev playwright'
      `)
  }

  const { type } = ctx.options.browserOptions
  if (!playwright[type]) {
    throw new Error(`Invalid browser '${type}'`)
  }

  ctx.browser = await playwright[type].launch()
}

export async function getBrowser (): Promise<Browser> {
  const ctx = getContext()
  if (!ctx.browser) {
    await createBrowser()
  }
  return ctx.browser
}

export async function createPage (path?: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  if (path) {
    page.goto(url(path))
  }

  return page
}
