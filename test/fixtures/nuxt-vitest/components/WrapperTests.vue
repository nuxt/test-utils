<script setup lang="ts">
const emit = defineEmits<{
  customEvent: [id: string]
  otherEvent: []
}>()

function testExpose () {
  return 'expose was successful'
}

defineExpose({
  testExpose
})
</script>

<template>
  <div>
    <button @click="emit('customEvent', 'foo'); $emit('otherEvent')">Click me!</button>
  </div>
</template>
