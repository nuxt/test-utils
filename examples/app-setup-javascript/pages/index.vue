<template>
  <div>
    <Message :text="title" />
    <NuxtLink to="/some-page">
      Some page
    </NuxtLink>
  </div>
</template>

<script>
export default {
  data () {
    return { title: 'The app works!' }
  }
}
</script>
