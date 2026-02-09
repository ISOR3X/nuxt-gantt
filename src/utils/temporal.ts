import { CalendarDate } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import { Temporal } from "temporal-polyfill";

export function colToDate(startDate: Temporal.PlainDate, col: number): Temporal.PlainDate {
  return startDate.add({ days: col });
}

export function dateToCol(startDate: Temporal.PlainDate, date: Temporal.PlainDate): number {
  return startDate.until(date).days;
}

export function formatDurationInDays(duration: Temporal.Duration): string {
  const d = duration.days;
  const suffix = d == 1 ? "day" : "days";
  return `${d} ${suffix}`;
}

/**
 * Format the date for display in the header
 */
export function formatColumnHeader(date: Temporal.PlainDate): string | undefined {
  if (date.dayOfWeek !== 1) return;

  const isFirstFullWeekOfYear = date.day <= 7 && date.month === 1;

  const formatted = date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    ...(isFirstFullWeekOfYear && date.dayOfWeek == 1 ? { year: "numeric" } : {}),
  });

  return formatted;
}

export function formatColumnDate(date: Temporal.PlainDate): string {
  const formatted = date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
  return formatted;
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
