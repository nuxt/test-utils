import { listen as listhen } from 'listhen'
import { joinURL } from 'ufo'
import { $fetch, FetchOptions } from 'ohmyfetch/node'
import { getContext } from './context'

export async function listen () {
  const ctx = getContext()
  const port = Number(ctx.options.config.server?.port)
  ctx.listener = await listhen(ctx.nuxt.server.app, { port: { port, random: !port } })
}

export function get<T> (path: string, options?: FetchOptions) {
  return $fetch<T>(url(path), options)
}

export function url (path: string) {
  const ctx = getContext()

  if (!ctx.listener) {
    throw new Error('server is not enabled')
  }

  return joinURL(ctx.listener.url, path)
}
