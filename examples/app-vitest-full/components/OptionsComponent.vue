<template>
  <h2>{{ title }}</h2>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ title?: string }>(),
  { title: 'The original' }
)

await new Promise(resolve => setTimeout(resolve, 1))
</script>
