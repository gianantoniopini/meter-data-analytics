import type { RouteRecordRaw } from 'vue-router'
import { createWebHistory, createRouter } from 'vue-router'
import TheHome from '@/components/TheHome.vue'
//import MeterData from '@/components/MeterData.vue'
import TheSettings from '@/components/TheSettings.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: TheHome
  },
  /*
  {
    path: '/meterdata',
    name: 'meterData',
    component: MeterData
  },
  */
  {
    path: '/settings',
    name: 'settings',
    component: TheSettings
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
