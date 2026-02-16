import type colors from "tailwindcss/colors";
import { Temporal } from "temporal-polyfill";

// REF: https://github.com/nuxt/ui/blob/v4/src/unplugin.ts#L27-L28
type NeutralColor = "slate" | "gray" | "zinc" | "neutral" | "stone";
export type Color =
  | Exclude<
      keyof typeof colors,
      "inherit" | "current" | "transparent" | "black" | "white" | NeutralColor
    >
  | (string & {});

// Helper function to allow sorting of tailwind classes in theme files.
export const tw = (strings: string, ...values: any[]) => String.raw({ raw: strings }, ...values);

export type DateRangeItem = { startDate: Temporal.PlainDate; endDate?: Temporal.PlainDate };
export function cloneDateRangeItem<T extends DateRangeItem>(item: T): T {
  return {
    ...item,
    startDate: Temporal.PlainDate.from(item.startDate.toString()),
    endDate: item.endDate ? Temporal.PlainDate.from(item.endDate.toString()) : undefined,
  };
}
