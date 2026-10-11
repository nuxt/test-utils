import { defineEventHandler, getQuery } from 'nuxt/server'

export default defineEventHandler((event) => {
  return getQuery(event)
})
