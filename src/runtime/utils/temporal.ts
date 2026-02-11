import { Temporal } from "temporal-polyfill";

export function getStartEndDateForTasks(): { start: Temporal.PlainDate; end: Temporal.PlainDate } {
  const now = Temporal.Now.plainDateISO();
  return { start: now.subtract({ months: 1 }), end: now.add({ months: 1 }) };
}
