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

<script lang="ts">
import { defineComponent } from 'vue';
import TheNavbar from '@/components/TheNavbar.vue';

export default defineComponent({
  name: 'App',

  components: { TheNavbar }
});
</script>
