<template>
  <h1>
    {{ config.public.myValue }}
  </h1>

  <button />
</template>

<script setup>
const config = useRuntimeConfig()
</script>
