<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Runtime Config: {{ config }}</p>
    <button @click="increment">
      Increment
    </button>
    <button @click="decrement">
      Decrement
    </button>
  </div>
</template>

<script setup lang="ts">
const count = ref(0)
const config = useRuntimeConfig()

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>
