<template>
  <div>
    {{ message }}
  </div>
</template>

<script setup lang="ts">
const { message } = useGlobalComponentMessage()
</script>
