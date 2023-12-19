<template>
  <button
    :type="type"
    v-bind="attrs"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    type: {
      type: String as () => 'button',
      default: 'button'
    }
  },
  setup () {
    return {
      attrs: computed(() => ({
        'data-test': 'true'
      }))
    }
  }
})
</script>
