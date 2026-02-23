import { Temporal } from "temporal-polyfill";

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
