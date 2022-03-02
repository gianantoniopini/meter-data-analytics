<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue';
</script>

<template>
  <div id="app">
    <!-- navbar -->
    <TheNavbar />

    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
