<script setup lang="ts">
const form = useTemplateRef('form')
const output = ref('')

async function submit() {
  const data = await $fetch('/api/forms/mutlipart', {
    method: 'post',
    body: new FormData(form.value!),
  })
  output.value = JSON.stringify(data, null, 2)
}
</script>

<template>
  <div>
    <form
      ref="form"
      @submit.prevent
    >
      <label for="name">Name</label>
      <input
        id="name"
        name="name"
      >
      <label for="file">File</label>
      <input
        id="file"
        name="file"
        type="file"
      >
      <button @click="submit">
        Submit
      </button>
    </form>
    <pre id="output">{{ output }}</pre>
  </div>
</template>
