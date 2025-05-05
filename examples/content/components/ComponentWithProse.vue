<template>
  <ProseH3>{{ heading }}</ProseH3>
  <ProseP>{{ content }}</ProseP>
</template>

<script lang="ts" setup>
defineProps<{
  heading: string
  content: string
}>()
</script>
