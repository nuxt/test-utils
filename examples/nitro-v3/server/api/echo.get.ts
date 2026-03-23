import { defineEventHandler, getQuery } from 'nitro/h3'

export default defineEventHandler((event) => {
  return getQuery(event)
})
