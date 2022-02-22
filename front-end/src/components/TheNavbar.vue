<template>
  <nav class="navbar navbar-expand-sm navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img
          src="../assets/logo.png"
          alt=""
          width="24"
          height="24"
          class="d-inline-block align-text-top"
        />
        Meter Data Analytics
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="navbar-nav text-center fw-bold mr-auto">
          <router-link :to="{ name: 'home' }" class="nav-link">{{
            $t('home.title')
          }}</router-link>
          <router-link :to="{ name: 'meterData' }" class="nav-link"
            >Meter Data</router-link
          >
          <router-link :to="{ name: 'settings' }" class="nav-link">{{
            $t('settings.title')
          }}</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TheNavbar'
});
</script>

<style scoped>
#navbarNav a.router-link-active,
#navbarNav a.router-link-exact-active {
  color: whitesmoke;
  background: crimson;
  border-radius: 0.5rem;
}
</style>
