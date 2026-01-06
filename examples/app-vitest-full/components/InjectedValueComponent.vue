<template>
  <div>
    <span>{{ value1 }}</span>
    <span>{{ value2 }}</span>
  </div>
</template>

<script setup lang="ts">
import {
  CUSTOM_VUE_PLUGIN_SYMBOL,
  CUSTOM_VUE_PLUGIN_SYMBOL2,
} from '../plugins/inject-value'

const value1 = inject(CUSTOM_VUE_PLUGIN_SYMBOL)
const value2 = inject(CUSTOM_VUE_PLUGIN_SYMBOL2)
</script>
