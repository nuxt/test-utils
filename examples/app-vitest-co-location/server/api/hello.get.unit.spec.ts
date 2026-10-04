import { it, expect } from 'vitest'
import { createApp, toWebHandler } from 'h3'
import handler from './hello.get'

it('/api/hello', async () => {
  const api = toWebHandler(createApp().use('/', handler))
  const req = new Request(new URL('http://localhost/?name=Nuxt'))
  const res = await api(req).then(r => r.json())
  expect(res).toEqual({ message: 'Hello Nuxt!' })
})
