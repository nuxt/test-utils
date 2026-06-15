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
const config = useRuntimeConfig()
const { count, increment, decrement } = useCounter()
</script>
