<template>
  <div>
    <h1>IndexedDbComponent</h1>
    <pre>{{ retrievedValue }}</pre>
  </div>
</template>
<script setup lang="ts">
import { get, set } from 'idb-keyval'

const props = defineProps<{ title: string }>()

const app = useNuxtApp()
const store = app.$store

await set('data', props.title, store)

const retrievedValue = await get('data', store)
</script>
