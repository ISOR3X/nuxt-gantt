import type colors from "tailwindcss/colors";
import { Temporal } from "temporal-polyfill";

import { Task } from "../types/gantt";

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

export function cloneTask(task: Task): Task {
  return {
    ...task,
    startDate: Temporal.PlainDate.from(task.startDate.toString()),
    endDate: task.endDate ? Temporal.PlainDate.from(task.endDate.toString()) : undefined,
  };
}
