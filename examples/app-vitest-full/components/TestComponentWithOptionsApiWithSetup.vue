<script>
export default defineComponent({
  props: {
    label: {
      type: String,
      default: () => '',
    },
    none: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: String,
      default: () => '',
    },
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['blur', 'update:modelValue', 'unmount', 'unmounted'],
  expose: ['disabled', 'getValue', 'setValue'],
  setup(props, { emit }) {
    const disabled = ref(false)

    function setValue(value) {
      emit('update:modelValue', value)
    }

    return {
      disabled,
      setValue,
    }
  },
  computed: {
    counter() {
      return this.disabled ? '' : `[${this.modelValue.length}/30]`
    },
  },
  beforeUnmount() {
    this.$emit('unmount')
  },
  unmounted() {
    this.$emit('unmounted')
  },
  methods: {
    getValue() {
      return this.modelValue
    },
  },
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
      :value="modelValue"
      :disabled
      data-test-id="input"
      @blur="$emit('blur')"
      @input="$emit('update:modelValue', $event.target.value)"
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
