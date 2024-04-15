<template>
  <div>basic <span>{{ config.public.myValue }}</span></div>
</template>

<script setup>
const config = useRuntimeConfig()
</script>
