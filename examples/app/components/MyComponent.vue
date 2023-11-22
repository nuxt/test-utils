<script setup lang="ts">
import type { MyComponentProps } from '~/types/component-props'

defineProps<MyComponentProps>()
</script>

<template>
  <div>
    {{ title }}
  </div>
</template>
