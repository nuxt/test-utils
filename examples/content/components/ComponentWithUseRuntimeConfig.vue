<template>
  <h1>Use Runtime Config</h1>
  <pre>{{ config }}</pre>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig()
</script>
