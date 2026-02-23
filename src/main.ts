import "virtual:color-utilities.css";
import "./assets/css/main.css";

import ui from "@nuxt/ui/vue-plugin";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import App from "./App.vue";
const app = createApp(App);

app.use(
  createRouter({
    routes: [
      {
        path: "/",
        component: () => import("./runtime/components/layout/ShellLayout.vue"),
        children: [
          {
            path: "",
            component: () => import("./pages/index.vue"),
          },
        ],
      },
      {
        path: "/export",
        component: () => import("./pages/export.vue"),
      },
    ],
    history: createWebHistory(import.meta.env.BASE_URL),
  }),
);

app.use(ui);

app.mount("#app");
