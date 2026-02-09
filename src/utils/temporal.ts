import { CalendarDate } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import { Temporal } from "temporal-polyfill";

import { Weekday } from "../types";

export const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * Convert a column index to a calendar date.
 *
 * When `workDays` is provided (and has fewer than 7 entries), columns only
 * represent workdays - off-days are skipped entirely.
 */
export function colToDate(
  startDate: Temporal.PlainDate,
  col: number,
  workDays?: Weekday[],
): Temporal.PlainDate {
  if (!workDays || workDays.length === 7) {
    return startDate.add({ days: col });
  }

  const sorted = [...workDays].sort((a, b) => a - b);
  const N = sorted.length;

  // Advance startDate to the first workday on or after it
  let adjusted = startDate;
  while (!sorted.includes(adjusted.dayOfWeek as Weekday)) {
    adjusted = adjusted.add({ days: 1 });
  }

  const startIdx = sorted.indexOf(adjusted.dayOfWeek as Weekday);
  const totalWorkDayIndex = startIdx + col;

  const fullWeeks = Math.floor(totalWorkDayIndex / N);
  const remainder = ((totalWorkDayIndex % N) + N) % N; // Euclidean remainder, always 0..N-1

  const targetDow = sorted[remainder];
  const dayOffset = targetDow - adjusted.dayOfWeek;
  const calendarDays = fullWeeks * 7 + dayOffset;

  return adjusted.add({ days: calendarDays });
}

/**
 * Convert a calendar date to a column index.
 *
 * When `workDays` is provided (and has fewer than 7 entries), only workdays
 * are counted - off-days don't occupy column space.
 */
export function dateToCol(
  startDate: Temporal.PlainDate,
  date: Temporal.PlainDate,
  workDays?: Weekday[],
): number {
  if (!workDays || workDays.length === 7) {
    return startDate.until(date).days;
  }

  const sorted = [...workDays].sort((a, b) => a - b);
  const N = sorted.length;

  // Advance startDate to the first workday on or after it
  let adjusted = startDate;
  while (!sorted.includes(adjusted.dayOfWeek as Weekday)) {
    adjusted = adjusted.add({ days: 1 });
  }

  const totalCalendarDays = adjusted.until(date).days;
  const fullWeeks = Math.floor(totalCalendarDays / 7);
  const remainingDays = ((totalCalendarDays % 7) + 7) % 7; // always positive

  // Count workdays in the partial-week remainder
  const startDow = adjusted.dayOfWeek;
  let partialWorkDays = 0;
  for (let i = 0; i < remainingDays; i++) {
    const dow = ((((startDow - 1 + i) % 7) + 7) % 7) + 1;
    if (sorted.includes(dow as Weekday)) {
      partialWorkDays++;
    }
  }

  return fullWeeks * N + partialWorkDays;
}

/**
 * Count the total number of visible columns (workdays) in an inclusive date range.
 *
 * When `workDays` is omitted or has 7 entries, this is simply the calendar day count.
 */
export function countColumnsInRange(
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
  workDays?: Weekday[],
): number {
  if (!workDays || workDays.length === 7) {
    return startDate.until(endDate).days + 1;
  }

  const sorted = [...workDays].sort((a, b) => a - b);
  const N = sorted.length;

  const totalCalendarDays = startDate.until(endDate).days + 1; // inclusive
  const fullWeeks = Math.floor(totalCalendarDays / 7);
  const remainingDays = totalCalendarDays % 7;

  const startDow = startDate.dayOfWeek;
  let partialWorkDays = 0;
  for (let i = 0; i < remainingDays; i++) {
    const dow = ((((startDow - 1 + i) % 7) + 7) % 7) + 1;
    if (sorted.includes(dow as Weekday)) {
      partialWorkDays++;
    }
  }

  return fullWeeks * N + partialWorkDays;
}

export function formatDurationInDays(duration: Temporal.Duration): string {
  const d = duration.days;
  const suffix = d == 1 ? "day" : "days";
  return `${d} ${suffix}`;
}

/**
 * Format the date for display in the header.
 *
 * Shows a label on the first workday of each ISO week (defaults to Monday).
 * When off-days are hidden the first visible day of each week should still
 * produce a label, so `firstWorkDay` lets the caller override the trigger.
 */
export function formatColumnHeader(
  date: Temporal.PlainDate,
  firstWorkDay: Weekday = 1,
): string | undefined {
  if (date.dayOfWeek !== firstWorkDay) return;

  const isFirstFullWeekOfYear = date.day <= 7 && date.month === 1;

  const formatted = date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    ...(isFirstFullWeekOfYear && date.dayOfWeek == firstWorkDay ? { year: "numeric" } : {}),
  });

  return formatted;
}

/**
 * Format the date for display in the popover
 */
export function formatColumnDate(date: Temporal.PlainDate): string {
  const formatted = date.toLocaleString("en", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
  return formatted;
}

export function weekDaysInRange(startWeekDay: Weekday, endWeekDay: Weekday): Weekday[] {
  const days: Weekday[] = [];
  let current = startWeekDay;

  while (current !== endWeekDay) {
    days.push(current);
    current = ((current % 7) + 1) as Weekday;
  }
  days.push(endWeekDay);

  return days;
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
