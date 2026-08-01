<template>
  <button
    data-testid="test-button"
    @click="$emit('test-button-click')"
  >
    Button in TestButton component
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'test-button-click'): void
}>()
</script>
