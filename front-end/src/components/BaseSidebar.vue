<script setup lang="ts">
interface SidebarMenuItem {
  href: string
  title: string
  biClass: string
}

interface Properties {
  menuItems: SidebarMenuItem[]
}

defineProps<Properties>()
</script>

<template>
  <div class="d-flex flex-sm-column flex-row flex-nowrap bg-light sticky-top" role="navigation">
    <ul
      class="nav nav-pills nav-flush flex-sm-column flex-row flex-nowrap mb-auto mx-auto justify-content-between w-100 px-3"
    >
      <li v-for="(item, index) in menuItems" :key="index" class="nav-item">
        <a
          :href="item.href"
          class="nav-link py-3 px-2"
          :title="item.title"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          :data-bs-original-title="item.title"
        >
          <i class="fs-4" :class="item.biClass"></i
          ><span class="ms-1 d-none d-sm-inline">{{ item.title }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
