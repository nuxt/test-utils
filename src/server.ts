import { listen as listhen } from 'listhen'
import { joinURL } from 'ufo'
import got, { OptionsOfUnknownResponseBody } from 'got'
import { getContext } from './context'

export async function listen () {
  const ctx = getContext()
  const { server } = ctx.options.config
  const { url } = await listhen(ctx.nuxt.server.app, {
    ...(server?.port && { port: Number(server?.port) })
  })

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

  return joinURL(ctx.url, path)
}
