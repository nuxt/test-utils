<script setup lang="ts">
async function normalFetcher() {
  const fetcher = $fetch.create({})
  await fetcher('/test1/')
}

async function customFetcher() {
  const fetcher = $fetch.create({
    onRequest() {},
  })
  await fetcher('/test2/')
}

async function onceFetcher() {
  try {
    const fetcher = $fetch.create({})
    await fetcher('/test-once/')
  }
  catch {
    // Expected to fail on second call
  }
}

async function onceReregisterFetcher() {
  try {
    const fetcher = $fetch.create({})
    await fetcher('/test-once-reregister/')
  }
  catch {
    // Expected to fail on second call
  }
}

async function onceMethodGetFetcher() {
  try {
    const fetcher = $fetch.create({})
    await fetcher('/test-method-once/', { method: 'GET' })
  }
  catch {
    // Expected to fail on second call
  }
}

async function onceMethodPostFetcher() {
  try {
    const fetcher = $fetch.create({})
    await fetcher('/test-method-once/', { method: 'POST' })
  }
  catch {
    // Expected to fail on second call
  }
}
</script>

<template>
  <div>
    <button
      id="normal-fetcher"
      @click="normalFetcher"
    >
      normal fetch
    </button>
    <button
      id="custom-fetcher"
      @click="customFetcher"
    >
      custom fetch
    </button>
    <button
      id="once-fetcher"
      @click="onceFetcher"
    >
      once fetch
    </button>
    <button
      id="once-reregister-fetcher"
      @click="onceReregisterFetcher"
    >
      once reregister fetch
    </button>
    <button
      id="once-method-get-fetcher"
      @click="onceMethodGetFetcher"
    >
      once method GET fetch
    </button>
    <button
      id="once-method-post-fetcher"
      @click="onceMethodPostFetcher"
    >
      once method POST fetch
    </button>
  </div>
</template>
