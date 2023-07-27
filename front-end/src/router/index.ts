import type { RouteRecordRaw } from 'vue-router'
import { createWebHistory, createRouter } from 'vue-router'
import TheHome from '@/components/TheHome.vue'
import MeterData from '@/components/MeterData.vue'
import TheSettings from '@/components/TheSettings.vue'

const appTitle = 'Meter Data Analytics'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    meta: { title: appTitle },
    component: TheHome
  },
  {
    path: '/meterdata',
    name: 'meterData',
    meta: { title: appTitle },
    component: MeterData
  },
  {
    path: '/settings',
    name: 'settings',
    meta: { title: appTitle },
    component: TheSettings
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title as string
  next()
})

export default router
