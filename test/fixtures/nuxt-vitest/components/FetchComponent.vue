<template>
  <div>{{ data.title }}</div>
</template>

<script setup>
const { data } = await useFetch('https://jsonplaceholder.typicode.com/todos/1')
</script>
