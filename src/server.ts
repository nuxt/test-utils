import { listen as listhen } from 'listhen'
import { joinURL } from 'ufo'
import { $fetch, FetchOptions } from 'ohmyfetch/node'
import { getContext } from './context'

export async function listen () {
  const ctx = getContext()
  const port = Number(ctx.options.config.server?.port)
  ctx.listener = await listhen(ctx.nuxt.server.app, { port: { port, random: !port } })
}

export async function get<T> (path: string, options?: FetchOptions) {
  return $fetch<T>(await url(path), options)
}

export async function url (path: string) {
  const ctx = getContext()

  if (!ctx.listener?.url) {
    await listen()
  }

  return joinURL(ctx.listener.url, path)
}
