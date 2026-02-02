import { CalendarDate } from "@internationalized/date";
import { parseDate, parseDateTime, parseZonedDateTime } from "@internationalized/date";
import { CalendarDateTime, ZonedDateTime } from "@internationalized/date";

export function isBetween(
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  current: Temporal.PlainDate,
) {
  return (
    Temporal.PlainDate.compare(current, start) >= 0 && Temporal.PlainDate.compare(current, end) <= 0
  );
}

export function daysBetween(date1: Temporal.PlainDate, date2: Temporal.PlainDate): number {
  return Math.abs(date1.until(date2).days);
}

export function colToDate(startDate: Temporal.PlainDate, col: number): Temporal.PlainDate {
  return startDate.add({ days: col });
}

export function dateToCol(startDate: Temporal.PlainDate, date: Temporal.PlainDate): number {
  return startDate.until(date).days;
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
