import { Temporal } from "temporal-polyfill";

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

export function colToDate(startDate: Temporal.PlainDate, col: number): Temporal.PlainDate{
  return startDate.add({days: col})
}
