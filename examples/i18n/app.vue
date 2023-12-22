<template>
  <div>
    Hi from @nuxtjs/i18n: {{ $t('hello') }}
  </div>
  <div>
    Hi from @nuxtjs/i18n with useI18n: {{ str }}
  </div>
</template>

<script setup>
const i18n = useI18n()

const str = i18n.t("hello")
</script>
