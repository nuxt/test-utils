import { defineEventHandler, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  return parts?.map(part => ({ ...part, data: part.data.toString('utf8') })) ?? []
})
