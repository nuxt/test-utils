<template>
  <div>
    {{ text }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    text: {
      type: String,
      default: 'Hello world!'
    }
  }
})
</script>
