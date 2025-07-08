<template>
  <div />
</template>

<script>
export default {
  emits: ['event-from-setup', 'event-from-before-mount', 'event-from-mounted'],
  setup(_props, context) {
    context.emit('event-from-setup', 1)

    setTimeout(() => {
      context.emit('event-from-setup', 2)
    }, 1)
  },
  beforeMount() {
    this.$emit('event-from-before-mount', 1)

    setTimeout(() => {
      this.$emit('event-from-before-mount', 2)
    }, 1)
  },
  mounted() {
    this.$emit('event-from-mounted', 1)

    setTimeout(() => {
      this.$emit('event-from-mounted', 2)
    }, 1)
  },
}
</script>
