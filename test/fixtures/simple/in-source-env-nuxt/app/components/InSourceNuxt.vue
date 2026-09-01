<template>
  <div />
</template>

<script lang="ts">
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('window', () => {
    expect(globalThis.window).toBeDefined()
  })
}
</script>
