<template>
  <div>
    <button
      id="tryUseNuxtApp-callHook"
      @click="tryNuxtApp?.callHook(callHook)"
    >
      tryNuxtApp?.callHook
    </button>
    <button
      id="useNuxtApp-callHook"
      @click="nuxtApp.callHook(callHook)"
    >
      nuxtApp.callHook
    </button>
    <div id="useRuntimeConfig-public-API_ENTRYPOINT">
      {{ config.public.API_ENTRYPOINT }}
    </div>
    <div id="useRoute-path">
      {{ route.path }}
    </div>
    <button
      id="useRouter-push"
      @click="router.push(pushPath)"
    >
      useRouter.push
    </button>
    <button
      id="navigateTo"
      @click="navigateTo(pushPath)"
    >
      navigateTo
    </button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtApp } from '#app'

const {
  callHook = 'page:finish',
  pushPath = '/push-path',
} = defineProps<{
  callHook?: Parameters<NuxtApp['callHook']>[0]
  pushPath?: string
}>()

const tryNuxtApp = tryUseNuxtApp()
const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
</script>
