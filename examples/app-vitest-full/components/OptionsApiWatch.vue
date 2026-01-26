<template>
  <pre data-testid="set-by-watches">{{ setByWatches }}</pre>
</template>

<script>
const externalStore = reactive({
  dataFromExternalReactiveStore: 'data-from-external-reactive-store',
})

export default {
  emits: [
    'event-from-internal-data-object',
    'event-mapped-from-external-reactive-store',
  ],
  data() {
    return {
      dataFromInternalDataObject: 'data-from-internal-data-object',
      setByWatches: {
        dataFromInternalDataObject: 'initial-data-from-data-function',
        dataMappedFromExternalReactiveStore: 'initial-data-from-data-function',
      },
    }
  },
  computed: {
    dataMappedFromExternalReactiveStore() {
      return externalStore.dataFromExternalReactiveStore
    },
  },
  watch: {
    dataFromInternalDataObject: {
      immediate: true,
      handler(v) {
        this.$emit('event-from-internal-data-object', 1)
        return this.setByWatches.dataFromInternalDataObject = v
      },
    },
    dataMappedFromExternalReactiveStore: {
      immediate: true,
      handler(v) {
        this.$emit('event-mapped-from-external-reactive-store', 1)
        return this.setByWatches.dataMappedFromExternalReactiveStore = v
      },
    },
  },
}
</script>
