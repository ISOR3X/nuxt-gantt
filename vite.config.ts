import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import colorUtils from "./src/vite";

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
    colorUtils(["fill", "stroke"]),
  ],
});
