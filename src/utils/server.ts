import getPort from 'get-port'
import { getContext } from './context'

export async function listen() {
  const ctx = getContext()

  const port = await getPort()
  ctx.url = 'http://localhost:' + port
  await ctx.nuxt.listen(port)
}

export function url(path) {
  const ctx = getContext()

  return ctx.url + path
}
