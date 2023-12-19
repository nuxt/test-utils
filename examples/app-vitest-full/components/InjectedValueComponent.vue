<template>
  <div>
    {{ value }}
  </div>
</template>

<script setup lang="ts">
import { CUSTOM_VUE_PLUGIN_SYMBOL } from '../plugins/inject-value'

const value = inject(CUSTOM_VUE_PLUGIN_SYMBOL)
</script>
