import { defineEventHandler, getHeaders, readRawBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, 'utf8')
  return { body, headers: getHeaders(event) }
})
