import got, { OptionsOfUnknownResponseBody } from 'got'
import { getContext } from './context'

export async function listen () {
  const ctx = getContext()
  const { server } = ctx.options.config

  const port = server?.port || 0
  const { url } = await ctx.nuxt.listen(port)

  ctx.url = url
}

export function get (path: string, options?: OptionsOfUnknownResponseBody) {
  return got(url(path), options)
}

export function url (path: string) {
  const ctx = getContext()

  if (!ctx.url) {
    throw new Error('server is not enabled')
  }

  const { href } = new URL(path, ctx.url)

  return href
}
