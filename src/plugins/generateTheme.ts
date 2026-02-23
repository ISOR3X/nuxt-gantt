import fs from "node:fs";
import path from "node:path";

import { kebabCase } from "scule";
import type { Plugin } from "vite";

import * as theme from "../theme";

function writeThemeTemplate(colors: Record<string, any>, path?: string) {
  const templates: { filename: string; write: boolean; getContents: () => Promise<string> }[] = [];
  for (const component in theme) {
    templates.push({
      filename: `ui/${path ? path + "/" : ""}${kebabCase(component)}.ts`,
      write: true,
      getContents: async () => {
        const template = (theme as any)[component];
        let result = typeof template === "function" ? template(colors) : template;

        const variants = Object.entries(result.variants || {})
          .filter(([_, values]) => {
            const keys = Object.keys(values as Record<string, unknown>);
            return keys.some((key) => key !== "true" && key !== "false");
          })
          .map(([key]) => key);

        let json = JSON.stringify(result, null, 2);

        for (const variant of variants) {
          json = json.replace(
            new RegExp(`("${variant}": "[^"]+")`, "g"),
            `$1 as typeof ${variant}[number]`,
          );
          json = json.replace(
            new RegExp(`("${variant}": \\[\\s*)((?:"[^"]+",?\\s*)+)(\\])`, "g"),
            (_, before, match, after) => {
              const replaced = match.replace(/("[^"]+")/g, `$1 as typeof ${variant}[number]`);
              return `${before}${replaced}${after}`;
            },
          );
        }

        function generateVariantDeclarations(variants: string[]) {
          return variants
            .filter((variant) => json.includes(`as typeof ${variant}`))
            .map((variant) => {
              const keys = Object.keys(result.variants[variant]);
              return `const ${variant} = ${JSON.stringify(keys, null, 2)} as const`;
            });
        }

        // For production build
        return [...generateVariantDeclarations(variants), `export default ${json}`].join("\n\n");
      },
    });
  }
  return templates;
}

async function writeTemplates(templates: any[], root: string) {
  const map: Record<string, string> = {};
  const dir = path.join(root, "node_modules", ".nuxt-ui");
  for (const template of templates) {
    if (!template.write || !template.filename) {
      continue;
    }
    const filePath = path.join(dir, template.filename);
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, await template.getContents!({} as any));

    map[`#build/${template.filename}`] = filePath;
  }
  return map;
}

export default function AppConfigPlugin(): Plugin {
  const virtualModuleId = "virtual:nuxt-gantt";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "nuxt-gantt:theme",
    enforce: "pre",
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;

      if (id.startsWith("#build/")) {
        const cacheDir = path.join(process.cwd(), "node_modules", ".nuxt-ui");
        const normalized = id.replace("#build/", "");
        return path.join(cacheDir, normalized + ".ts");
      }
    },
    async configResolved(config) {
      const appConfigPlugin = config.plugins.find((p) => p.name === "nuxt:ui:app-config");
      const loadFn =
        typeof appConfigPlugin?.load === "function"
          ? appConfigPlugin.load
          : appConfigPlugin?.load?.handler;
      const result = loadFn?.call({} as any, "virtual:nuxt-ui-app-config") as string | undefined;
      if (!result) return;
      const obj: any = JSON.parse(result.replace(/^\s*export default\s*/, "").trim());
      const templates = writeThemeTemplate(Object.keys(obj.ui.colors));

      await writeTemplates(templates, process.cwd());
    },
  };
}
