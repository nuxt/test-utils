<template>
  <div>Index page</div>
  <div>title: {{ posts[0].title }}</div>
</template>

<script setup lang="ts">
definePageMeta({
  value: 'set in index',
})
const posts = await queryContent('/').limit(1).find()
</script>
