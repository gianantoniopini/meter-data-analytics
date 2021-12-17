<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <router-link :to="{ name: 'home' }" class="navbar-brand"
        >Home</router-link
      >
      <div class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link :to="{ name: 'meterData' }" class="nav-link"
            >Meter Data</router-link
          >
        </li>
      </div>
    </nav>

    <div>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
});
</script>
