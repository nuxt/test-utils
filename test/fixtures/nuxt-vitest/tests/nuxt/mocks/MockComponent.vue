<script setup lang="ts">
const counter = ref(1)
const doubled = computed(() => counter.value * 2)
</script>

<template>
  <div>
    Mocked {{ counter }} * 2 = {{ doubled }}
  </div>
</template>
