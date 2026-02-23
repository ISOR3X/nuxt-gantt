import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import genTheme from "./src/plugins/generateTheme";

export default defineConfig({
  base: "/nuxt-gantt/",
  plugins: [
    vue(),
    ui({
      ui: {
        colors: {
          primary: "green",
          neutral: "zinc",
        },
      },
    }),
    genTheme(),
  ],
});
