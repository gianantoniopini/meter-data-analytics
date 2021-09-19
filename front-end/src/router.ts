import { createWebHistory, createRouter } from "vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("./components/Home.vue"),
  },
  {
    path: "/measurements",
    name: "measurements",
    component: () => import("./components/Measurements.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
