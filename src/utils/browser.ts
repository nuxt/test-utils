import { getContext } from './context'
import { url } from './server'

export async function createBrowser() {
  const ctx = getContext()
  const tib = await import('tib')
  ctx.puppeteer = await tib.createBrowser('puppeteer')
}

export async function createPage(path: string) {
  const ctx = getContext()
  const page = await ctx.puppeteer.page(url(path))
  return page
}
