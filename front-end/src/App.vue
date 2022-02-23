<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <!-- navbar -->
        <TheNavbar />
      </div>

      <div class="row">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TheNavbar from '@/components/TheNavbar.vue';

export default defineComponent({
  name: 'App',

  components: { TheNavbar }
});
</script>
