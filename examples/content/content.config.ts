import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      source: '**',
      type: 'page',
    }),
  },
})
