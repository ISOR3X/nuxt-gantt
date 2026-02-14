import { useMemoize } from "@vueuse/core";
import { Temporal } from "temporal-polyfill";
import { onUnmounted } from "vue";

import { Weekday } from "../../types";

export function useColDateConversion() {
  /**
   * Convert a column index to a calendar date.
   *
   * When `workDays` is provided (and has fewer than 7 entries), columns only
   * represent workdays - off-days are skipped entirely.
   */
  const getColToDate = useMemoize(
    (startDate: Temporal.PlainDate, col: number, workDays?: Weekday[]): Temporal.PlainDate => {
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
    },
  );

  /**
   * Convert a calendar date to a column index.
   *
   * When `workDays` is provided (and has fewer than 7 entries), only workdays
   * are counted - off-days don't occupy column space.
   */
  const getDateToCol = useMemoize(
    (
      startDate: Temporal.PlainDate,
      date: Temporal.PlainDate,
      _key: string,
      workDays?: Weekday[],
    ): number => {
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
    },
  );

  function clearCache() {
    getColToDate.clear();
    getDateToCol.clear();
  }

  onUnmounted(() => clearCache());

  return { dateToCol: getDateToCol, colToDate: getColToDate, clearCache };
}
