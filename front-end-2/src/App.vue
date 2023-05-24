<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue'
</script>

<template>
  <!-- navbar -->
  <TheNavbar />

  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <RouterView />
      </div>
    </div>
  </div>
</template>
