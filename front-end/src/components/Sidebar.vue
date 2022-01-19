<template>
  <div
    class="d-flex flex-sm-column flex-row flex-nowrap bg-light align-items-center sticky-top"
    role="navigation"
  >
    <ul
      class="nav nav-pills nav-flush flex-sm-column flex-row flex-nowrap mb-auto mx-auto text-center justify-content-between w-100 px-3 align-items-center"
    >
      <li class="nav-item" v-for="(item, index) in menuItems" :key="index">
        <a
          :href="item.href"
          class="nav-link py-3 px-2"
          :title="item.title"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          :data-bs-original-title="item.title"
        >
          <i class="fs-2" :class="item.biClass"></i>
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface SidebarMenuItem {
  href: string;
  title: string;
  biClass: string;
}

export default defineComponent({
  name: 'Sidebar',

  props: {
    menuItems: {
      type: Object as PropType<SidebarMenuItem[]>,
      required: true
    }
  }
});
</script>
