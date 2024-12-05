<template>
  <span>{{ message }}</span>
</template>

<script setup>
import { useRouter } from '#imports'

const message = useRouter() ? 'should work with #imports' : 'failed'
</script>
