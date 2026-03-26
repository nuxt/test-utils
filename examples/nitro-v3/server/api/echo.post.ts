import { defineEventHandler, readBody } from 'nitro/h3'

export default defineEventHandler(async (event) => {
  return await readBody(event)
})
