import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler((event) => {
  const query = getQuery<{ name?: string | string[] }>(event)
  const name = Array.isArray(query.name) ? query.name[0] : query.name
  return { message: `Hello ${name || 'Unknown'}!` }
})
