import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler((event) => {
  const name = getQuery(event).name
  return { message: `Hello ${name}!` }
})
