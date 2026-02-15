import { Temporal } from "temporal-polyfill";

import { Weekday } from "../types/temporal";

export const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

export function getStartEndDateForTasks(): { start: Temporal.PlainDate; end: Temporal.PlainDate } {
  const now = Temporal.Now.plainDateISO();
  return { start: now.subtract({ months: 1 }), end: now.add({ months: 1 }) };
}
