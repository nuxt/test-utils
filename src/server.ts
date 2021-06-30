import { listen as listhen } from 'listhen'
import { joinURL } from 'ufo'
import { $fetch, FetchOptions } from 'ohmyfetch/node'
import { getContext } from './context'

export async function listen () {
  const ctx = getContext()
  const { server } = ctx.options.config
  const { url } = await listhen(ctx.nuxt.server.app, {
    ...(server?.port && { port: Number(server?.port) })
  })

  ctx.url = url
}

export function get<T> (path: string, options?: FetchOptions) {
  return $fetch<T>(url(path), options)
}

export function url (path: string) {
  const ctx = getContext()

  if (!ctx.url) {
    throw new Error('server is not enabled')
  }

  return joinURL(ctx.url, path)
}
