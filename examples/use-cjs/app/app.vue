<script setup lang="ts">
const hellos = [
  useCjsPureDefault(),
  useCjsPureNamespace(),
  useCjsWrapperDefault(),
  useCjsWrapperNamespace(),
]
</script>

<template>
  <div>
    <CjsPureDefault />
    <CjsPureNamespace />
    <CjsWrapperDefault />
    <CjsWrapperNamespace />
    <p
      v-for="(hello, i) in hellos"
      :key="i"
    >
      {{ hello }}
    </p>
  </div>
</template>
