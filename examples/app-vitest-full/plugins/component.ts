import TestButton from '~/components/TestButton.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('custom-test-button', TestButton)
})
