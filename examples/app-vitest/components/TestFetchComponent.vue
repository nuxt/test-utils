<script setup lang="ts">
async function normalFetcher() {
  const fetcher = $fetch.create({})
  await fetcher('/test1/')
}

async function customFetcher() {
  const fetcher = $fetch.create({
    onRequest() {},
  })
  await fetcher('/test2/')
}
</script>

<template>
  <div>
    <button
      id="normal-fetcher"
      @click="normalFetcher"
    >
      normal fetch
    </button>
    <button
      id="custom-fetcher"
      @click="customFetcher"
    >
      custom fetch
    </button>
  </div>
</template>
