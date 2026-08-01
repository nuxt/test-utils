<template>
  <div>
    <span>{{ value1 }}</span>
    <span>{{ value2 }}</span>
    <span>{{ value3?.join('|') }}</span>
  </div>
</template>

<script setup lang="ts">
import {
  CUSTOM_VUE_PLUGIN_SYMBOL,
  CUSTOM_VUE_PLUGIN_SYMBOL2,
  CUSTOM_VUE_PLUGIN_WITH_ARRAY_KEY,
} from '../plugins/inject-value'

const value1 = inject(CUSTOM_VUE_PLUGIN_SYMBOL)
const value2 = inject(CUSTOM_VUE_PLUGIN_SYMBOL2)
const value3 = inject<number[]>(CUSTOM_VUE_PLUGIN_WITH_ARRAY_KEY)
</script>
