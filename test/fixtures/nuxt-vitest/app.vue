<template>
  <LazySomeComponent />
  <GlobalComponent />
  <!-- TODO: <NuxtPage /> -->
  <NuxtLink to="/test">Test link</NuxtLink>
</template>

<script setup>
await new Promise(resolve => setTimeout(resolve, 1))
useHead({
  title: 'My App'
})
</script>
