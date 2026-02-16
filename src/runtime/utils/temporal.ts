import { CalendarDate, parseDate } from "@internationalized/date";
import { Temporal } from "temporal-polyfill";

import { Weekday } from "../types/temporal";

export const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

export function getStartEndDateForTasks(): { start: Temporal.PlainDate; end: Temporal.PlainDate } {
  const now = Temporal.Now.plainDateISO();
  return { start: now.subtract({ months: 1 }), end: now.add({ months: 1 }) };
}

// Workaround until Temporal is in Reka UI.
// REF: https://github.com/unovue/reka-ui/issues/2183
export function TemporalToIntDate(value: Temporal.PlainDate): CalendarDate {
  return parseDate(value.toString());
}

export function IntDateToTemporal(value: CalendarDate) {
  const iso = value.toString();
  return Temporal.PlainDate.from(iso);
}

export function formatDurationInDays(
  start: Temporal.PlainDate,
  end: Temporal.PlainDate | undefined,
): string {
  if (!end) {
    return "0 days";
  } else {
    const durationDays = start.until(end).days;
    const suffix = durationDays == 1 ? "day" : "days";
    return `${durationDays} ${suffix}`;
  }
}
