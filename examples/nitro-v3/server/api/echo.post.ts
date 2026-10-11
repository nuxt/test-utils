import { defineEventHandler, readBody } from 'nuxt/server'

export default defineEventHandler(async (event) => {
  return await readBody(event)
})
