<script setup lang="ts">
const props = defineProps<{
  error?: string
}>()
</script>

<template>
  <span>{{ props.error }}</span>
</template>
