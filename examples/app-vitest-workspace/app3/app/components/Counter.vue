<template>
  <div>
    <h2>{{ title }}</h2>
    <label for="count">
      Count
    </label>
    <input
      id="count"
      v-model="count"
      type="number"
    >
    <button @click="increment">
      Increment
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCounter } from '#imports'

const {
  title = 'Counter Component',
} = defineProps<{
  title?: string
}>()

const { count, increment } = useCounter()
</script>
