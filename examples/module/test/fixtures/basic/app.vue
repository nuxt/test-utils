<template>
  <div>
    basic <span id="runtime">{{ config.public.myValue }}</span>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
</script>
