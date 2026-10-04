<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div>
    <h1>Index Page</h1>
    <p>foo: {{ appConfig.foo }}</p>
  </div>
</template>
