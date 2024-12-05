<script setup lang="ts">
const nuxtApp = useNuxtApp()
</script>

<template>
  <span>{{ nuxtApp.isHydrating }}</span>
</template>
