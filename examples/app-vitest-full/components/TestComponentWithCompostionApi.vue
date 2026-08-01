<script setup lang="ts">
const {
  none = false,
  show = true,
  label = '',
} = defineProps<{
  none?: boolean
  show?: boolean
  label?: string
}>()

const emit = defineEmits<{
  blur: []
  unmount: []
  unmounted: []
}>()

const disabled = ref(false)
const inputRef = useTemplateRef('inputRef')
const modelValue = defineModel<string>({ default: '' })
const counter = computed(() => disabled.value ? '' : `[${modelValue.value.length}/30]`)

function setValue(value: string) {
  modelValue.value = value
}

function getValue() {
  return modelValue.value
}

onBeforeUnmount(() => emit('unmount'))
onUnmounted(() => emit('unmounted'))

defineExpose({
  disabled,
  setValue,
  getValue,
})
</script>

<template>
  <div
    v-if="!none"
    v-show="show"
    data-testid="container"
  >
    <label
      for="input"
      :class="$style.label"
      data-testid="label"
    >
      {{ label }}
    </label>
    <input
      id="input"
      ref="inputRef"
      v-model="modelValue"
      :disabled
      data-testid="input"
      @blur="emit('blur')"
    >
    <span data-testid="counter">{{ counter }}</span>
    <div data-testid="slot">
      <slot />
    </div>
    <SomeComponent data-testid="some-component" />
  </div>
</template>

<style module>
.label {
  color: red;
}
</style>
