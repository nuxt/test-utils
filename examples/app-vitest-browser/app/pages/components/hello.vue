<script setup lang="ts">
const route = useRoute()
const name = ref(route.query.name?.toString() || '')

definePageMeta({
  title: 'Hello',
})
</script>

<template>
  <MyHello v-model="name" />
</template>
