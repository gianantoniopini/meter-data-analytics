<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="px-4 py-5 my-5 text-center">
    <img
      class="d-block mx-auto mb-4"
      src="../assets/logo.png"
      alt=""
      width="50"
      height="50"
    />
    <h1 class="display-5 fw-bold">{{ t('home.welcomeMessage') }}</h1>
    <div class="col-lg-6 mx-auto">
      <p class="lead mb-4">{{ t('home.appDescription') }}</p>
    </div>
  </div>
</template>
