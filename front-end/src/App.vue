<template>
  <div id="app">
    <TheNavbar />
    <div>
      <router-view />
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
