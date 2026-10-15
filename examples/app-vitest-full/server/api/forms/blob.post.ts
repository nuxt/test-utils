import { defineEventHandler, getHeader, readRawBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, 'utf8')
  return { body, contentType: getHeader(event, 'content-type') }
})
