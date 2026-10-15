<script setup lang="ts">
const file = useTemplateRef('file')
const output = ref('')

async function submit() {
  const data = await $fetch('/api/forms/blob', {
    method: 'post',
    body: file.value?.files?.item(0),
  })
  output.value = JSON.stringify(data, null, 2)
}
</script>

<template>
  <div>
    <form @submit.prevent>
      <label for="file">File</label>
      <input
        id="file"
        ref="file"
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
