<template>
  <div>
    Hi from @nuxtjs/i18n: {{ $t('hello') }}
  </div>
  <div>
    Hi from @nuxtjs/i18n with useI18n: {{ setupTranslation }}
  </div>
</template>

<script setup>
const i18n = useI18n()

const setupTranslation = i18n.t('hello')
</script>
