import type { Plugin, ResolvedConfig } from "vite";

export default function colorUtilsPlugin(utilClasses: string[] = ["fill"]): Plugin {
  const virtualId = "virtual:color-utilities.css";
  const resolvedVirtualId = "\0" + virtualId;
  let css = "";

  return {
    name: "color-utilities",
    configResolved(config: ResolvedConfig) {
      const appConfigPlugin = config.plugins.find((p) => p.name === "nuxt:ui:app-config");
      const loadFn =
        typeof appConfigPlugin?.load === "function"
          ? appConfigPlugin.load
          : appConfigPlugin?.load?.handler;

      const result = loadFn?.call({} as any, "virtual:nuxt-ui-app-config") as string | undefined;

      let colors: string[] = [];
      if (result) {
        const match = result.match(/"colors"\s*:\s*(\{[^}]+\})/);
        if (match) {
          colors = [...match[1].matchAll(/"(\w+)"\s*:/g)].map((m) => m[1]);
        }
      }

      css = utilClasses
        .flatMap((util) =>
          colors.map((color) => `.${util}-${color} { ${util}: var(--ui-${color}); }`),
        )
        .join("\n");
    },
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    load(id) {
      if (id === resolvedVirtualId) return css;
    },
  };
}
