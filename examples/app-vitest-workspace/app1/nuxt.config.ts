// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    rootAttrs: {
      class: 'nuxt-root-class',
      style: '',
      tabindex: 0,
      spellcheck: true,
      draggable: 'true', // as `<div draggable="true" />`
    },
    teleportAttrs: {
      class: 'teleport-class',
      tabindex: -1,
      spellcheck: false,
      draggable: true, // as `<div draggable />`
    },
  },
  compatibilityDate: '2024-04-03',
})
