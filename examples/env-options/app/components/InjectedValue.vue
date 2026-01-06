<template>
  <div>{{ value }}</div>
</template>

<script setup lang="ts">
import { INJECTED_SYMBOL } from '~/plugins/injected-value'

const value = inject(INJECTED_SYMBOL)
</script>
