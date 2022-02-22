import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/TheHome.vue')
  },
  {
    path: '/meterdata',
    name: 'meterData',
    component: () => import('./components/MeterData.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./components/TheSettings.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
