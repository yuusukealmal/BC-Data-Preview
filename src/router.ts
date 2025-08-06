import { createRouter, createWebHistory } from "vue-router";

import Home from "./pages/Home.vue";
import ErrorPage from "./pages/ErrorPage.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/:pathMatch(.*)*", name: "notFound", component: ErrorPage },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
