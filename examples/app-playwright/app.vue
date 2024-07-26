<template>
  <h1>
    {{ config.public.myValue }}
  </h1>
</template>

<script setup>
const config = useRuntimeConfig()
</script>
