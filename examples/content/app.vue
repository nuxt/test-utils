<template>
  <div>Index page</div>
  <div>title: {{ post.title }}</div>
</template>

<script setup lang="ts">
definePageMeta({
  value: 'set in index',
})
const post = await queryCollection('pages').path('/').first()
</script>
