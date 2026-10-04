<script setup lang="ts">
import scans from '#build/test-collect-scans.mjs'

const appConfig = useAppConfig()
</script>

<template>
  <div>
    <h1>Index Page</h1>
    <p id="app-config">
      foo: {{ appConfig.foo }}
    </p>
    <p id="scans">
      {{ scans }}
    </p>
  </div>
</template>
