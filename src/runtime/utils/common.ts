import type colors from "tailwindcss/colors";

// REF: https://github.com/nuxt/ui/blob/v4/src/unplugin.ts#L27-L28
type NeutralColor = "slate" | "gray" | "zinc" | "neutral" | "stone";
export type Color =
  | Exclude<
      keyof typeof colors,
      "inherit" | "current" | "transparent" | "black" | "white" | NeutralColor
    >
  | (string & {});
