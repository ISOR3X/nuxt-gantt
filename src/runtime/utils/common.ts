import { Temporal } from "temporal-polyfill";

// Helper function to allow sorting of tailwind classes in theme files.
export const tw = (strings: string, ...values: any[]) => String.raw({ raw: strings }, ...values);

// REF: https://github.com/nuxt/ui/blob/v4/src/module.ts#L10
export type Color =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | (string & {});

export type DateRangeItem = { startDate: Temporal.PlainDate; endDate?: Temporal.PlainDate };
export function cloneDateRangeItem<T extends DateRangeItem>(item: T): T {
  return {
    ...item,
    startDate: Temporal.PlainDate.from(item.startDate.toString()),
    endDate: item.endDate ? Temporal.PlainDate.from(item.endDate.toString()) : undefined,
  };
}
