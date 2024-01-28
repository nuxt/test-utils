<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div>Index page, path: {{ route.path }}</div>
</template>
