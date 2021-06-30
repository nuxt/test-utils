import getPort from 'get-port'
import { $fetch, FetchOptions } from 'ohmyfetch/node'
import { getContext } from './context'

export async function listen () {
  const ctx = getContext()
  const { server } = ctx.options.config
  const port = await getPort({
    ...(server?.port && { port: Number(server?.port) })
  })

  ctx.url = 'http://localhost:' + port

  await ctx.nuxt.listen(port)
}

export function get (path: string, options?: FetchOptions) {
  return $fetch(url(path), options)
}

export function url (path: string) {
  const ctx = getContext()

  if (!ctx.url) {
    throw new Error('server is not enabled')
  }

  return ctx.url + path
}
