<script setup lang="ts">
const { isPositive } = useCounter()
const { data } = useLazyAsyncData(async () => {
  return isPositive() ? 'positive' : 'zero-or-negative'
})
</script>

<template>
  <div v-if="data === 'positive'">
    Positive count
  </div>
  <div v-else>
    Zero or negative count
  </div>
</template>
