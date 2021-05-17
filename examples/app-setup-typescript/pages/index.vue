<template>
  <div>
    <Message :text="title" />
    <NuxtLink to="/some-page">
      Some page
    </NuxtLink>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data () {
    return { title: 'The app works!' }
  }
})
</script>
