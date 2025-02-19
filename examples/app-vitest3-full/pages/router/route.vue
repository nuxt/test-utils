<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useRoute as useNuxtRoute } from '#imports'

const route = useRoute()
const nuxtRoute = useNuxtRoute()
</script>

<template>
  <div>Index page, path: {{ route.path }}, {{ nuxtRoute.path }}</div>
</template>
