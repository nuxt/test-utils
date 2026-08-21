<script setup lang="ts">
const name = defineModel<string>({ default: () => '' })
const { data } = useHelloApi(name)
</script>

<template>
  <div>
    <label for="name">Name</label>
    <input
      id="name"
      v-model="name"
    >
    <br>
    <label for="message">Message</label>
    <textarea
      id="message"
      :value="data.message"
      readonly
    />
  </div>
</template>
