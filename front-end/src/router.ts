import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/Home.vue')
  },
  {
    path: '/meterdata',
    name: 'meterData',
    component: () => import('./components/MeterData.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
