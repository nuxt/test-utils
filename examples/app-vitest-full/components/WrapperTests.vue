<script setup lang="ts">
const emit = defineEmits<{
  customEvent: [id: string]
  otherEvent: []
}>()

function testExpose () {
  return 'expose was successful'
}

const someRef = ref('thing')

const modelValue = defineModel({ default: false })

defineExpose({
  testExpose,
  someRef
})
</script>

<template>
  <div>
    <button
      id="emitCustomEvent"
      @click="emit('customEvent', 'foo'); $emit('otherEvent')"
    >
      Click me!
    </button>
    <button
      id="changeModelValue"
      @click="modelValue = true"
    />
  </div>
</template>
