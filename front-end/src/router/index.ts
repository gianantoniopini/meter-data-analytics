import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
import TheHome from '@/components/TheHome.vue';
import MeterData from '@/components/MeterData.vue';
import TheSettings from '@/components/TheSettings.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: TheHome
  },
  {
    path: '/meterdata',
    name: 'meterData',
    component: MeterData
  },
  {
    path: '/settings',
    name: 'settings',
    component: TheSettings
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
