<template>
  <pre data-testid="set-by-watches">{{ setByWatches }}</pre>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

const reactiveString = ref(
  'data-from-reactive-string',
)

const reactiveObject = reactive({
  data: 'data-from-reactive-object',
})

const emit = defineEmits<{
  'event-from-watch-effect-on-computed-from-reactive-object': [number]
  'event-from-watch-effect-on-reactive-object': [number]
  'event-from-watch-effect-on-reactive-string': [number]
  'event-from-watch-on-computed-from-reactive-object': [number]
  'event-from-watch-on-reactive-object': [number]
  'event-from-watch-on-reactive-string': [number]
}>()

const setByWatches = reactive({
  dataFromWatchEffectOnComputedFromReactiveObject: 'initial-data-from-setup',
  dataFromWatchEffectOnReactiveObject: 'initial-data-from-setup',
  dataFromWatchEffectOnReactiveString: 'initial-data-from-setup',
  dataFromWatchOnComputedFromReactiveObject: 'initial-data-from-setup',
  dataFromWatchOnReactiveObject: 'initial-data-from-setup',
  dataFromWatchOnReactiveString: 'initial-data-from-setup',
})

const computedFromReactiveObject = computed(() => {
  return reactiveObject.data
})

watchEffect(
  () => {
    emit('event-from-watch-effect-on-reactive-string', 1)
    setByWatches.dataFromWatchEffectOnReactiveString = reactiveString.value
  },
)

watchEffect(
  () => {
    emit('event-from-watch-effect-on-reactive-object', 1)
    setByWatches.dataFromWatchEffectOnReactiveObject = reactiveObject.data
  },
)

watchEffect(
  () => {
    emit('event-from-watch-effect-on-computed-from-reactive-object', 1)
    setByWatches.dataFromWatchEffectOnComputedFromReactiveObject = computedFromReactiveObject.value
  },
)

watch(
  reactiveString,
  (v) => {
    emit('event-from-watch-on-reactive-string', 1)
    setByWatches.dataFromWatchOnReactiveString = v
  },
  { immediate: true },
)

watch(
  reactiveObject,
  (v) => {
    emit('event-from-watch-on-reactive-object', 1)
    setByWatches.dataFromWatchOnReactiveObject = v.data
  },
  { immediate: true },
)

watch(
  computedFromReactiveObject,
  (v) => {
    emit('event-from-watch-on-computed-from-reactive-object', 1)
    setByWatches.dataFromWatchOnComputedFromReactiveObject = v
  },
  { immediate: true },
)
</script>
