import { fileURLToPath } from "node:url";

import { Resolver } from "@nuxt/kit";
import { Nuxt, NuxtTemplate } from "@nuxt/schema";
import { ModuleOptions } from "@nuxt/ui";
import { kebabCase } from "scule";

import * as theme from "./theme";

export function getCustomTemplates(options: { ui: { colors: Record<string, string> } }) {
  const templates: NuxtTemplate[] = [];

  const isDev = process.argv.includes("--uiDev");

  function writeThemeTemplate(theme: Record<string, any>, path?: string) {
    for (const component in theme) {
      templates.push({
        filename: `ui/${path ? path + "/" : ""}${kebabCase(component)}.ts`,
        write: true,
        getContents: async () => {
          const template = (theme as any)[component];
          let result = typeof template === "function" ? template(options) : template;

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

          // For local development, import directly from theme
          if (isDev) {
            const templatePath = fileURLToPath(
              new URL(`./theme/${path ? `${path}/` : ""}${kebabCase(component)}`, import.meta.url),
            );
            const themeUtilsPath = fileURLToPath(new URL("./utils/theme", import.meta.url));

            return [
              `import template from ${JSON.stringify(templatePath)}`,
              `import { applyDefaultVariants, applyPrefixToObject } from ${JSON.stringify(themeUtilsPath)}`,
              ...generateVariantDeclarations(variants),
              `const options = ${JSON.stringify(options, null, 2)}`,
              `let result = typeof template === 'function' ? (template as Function)(options) : template`,
              `result = applyDefaultVariants(result, options.theme?.defaultVariants)`,
              `result = applyPrefixToObject(result, options.theme?.prefix)`,
              `const theme = ${json}`,
              `export default result as typeof theme`,
            ].join("\n\n");
          }

          // For production build
          return [...generateVariantDeclarations(variants), `export default ${json}`].join("\n\n");
        },
      });
    }
  }

  writeThemeTemplate(theme);

  templates.push({
    filename: "ui.css",
    write: true,
    getContents: async () => {
      return '@source "./ui";';
    },
  });

  templates.push({
    filename: "ui/index.ts",
    write: true,
    getContents: () =>
      Object.keys(theme)
        .map((component) => `export { default as ${component} } from './${kebabCase(component)}'`)
        .join("\n"),
  });

  return templates;
}
