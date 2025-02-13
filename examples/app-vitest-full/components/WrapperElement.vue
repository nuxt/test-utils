<script setup lang="ts">
defineProps<{
  as: string
}>()
</script>

<template>
  <component
    :is="as"
    v-bind="$attrs"
  />
</template>
