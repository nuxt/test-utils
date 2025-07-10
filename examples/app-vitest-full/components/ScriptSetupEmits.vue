<template>
  <div />
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'

const emit = defineEmits<{
  'event-from-setup': [number]
  'event-from-before-mount': [number]
  'event-from-mounted': [number]
}>()

emit('event-from-setup', 1)

setTimeout((): void => {
  emit('event-from-setup', 2)
}, 1)

onBeforeMount(() => {
  emit('event-from-before-mount', 1)

  setTimeout(() => {
    emit('event-from-before-mount', 2)
  }, 1)
})

onMounted(() => {
  emit('event-from-mounted', 1)

  setTimeout(() => {
    emit('event-from-mounted', 2)
  }, 1)
})
</script>
