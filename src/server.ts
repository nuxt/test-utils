import getPort from 'get-port'
import got, { OptionsOfUnknownResponseBody } from 'got'
import { getContext } from './context'

export async function listen () {
  const ctx = getContext()
  const port = await getPort()

  ctx.url = 'http://localhost:' + port

  await ctx.nuxt.listen(port)
}

export function get (path: string, options?: OptionsOfUnknownResponseBody) {
  return got(url(path), options)
}

export function url (path: string) {
  const ctx = getContext()

  return ctx.url + path
}
