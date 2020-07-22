import { getContext } from './context'
import { url } from './server'

export async function createBrowser () {
  const ctx = getContext()
  const tib = await import('tib')

  ctx.browser = await tib.createBrowser(ctx.browserString, ctx.browserOptions)
}

export async function createPage (path: string) {
  const ctx = getContext()
  const page = await ctx.browser.page(url(path))

  return page
}
