import { defineEventHandler, getQuery } from 'nuxt/server'

export default defineEventHandler(event => getQuery(event))
