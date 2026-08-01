<template>
  <div>dot-config <span>{{ config.public.myValue }}</span></div>
</template>

<script setup>
const config = useRuntimeConfig()
</script>
