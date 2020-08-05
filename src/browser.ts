import { getContext } from './context'
import { url } from './server'

export async function createBrowser () {
  const ctx = getContext()
  const tib = await import('tib')

  if (ctx.browserString === 'puppeteer') {
    try {
      require.resolve(ctx.browserString)
    } catch {
      throw new Error(`
        The dependency '${ctx.browserString}' not found.
        Please run 'yarn add ${ctx.browserString} --dev' or 'npm install ${ctx.browserString} --save-dev'
      `)
    }
  }

  ctx.browser = await tib.createBrowser(ctx.browserString, ctx.browserOptions)
}

export async function createPage (path: string) {
  const ctx = getContext()
  const page = await ctx.browser.page(url(path))

  return page
}
