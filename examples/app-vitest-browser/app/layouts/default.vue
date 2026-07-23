<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div>
    <Header />
    <main>
      <h2>{{ route.meta.title }}</h2>
      <slot />
    </main>
  </div>
</template>
