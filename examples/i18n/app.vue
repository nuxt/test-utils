<script setup>
const { t } = useI18n()
</script>

<template>
  <div>
    Hi from @nuxtjs/i18n: $t({{ $t('hello') }}) t({{ t('hello') }})
  </div>
</template>
