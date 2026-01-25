import { Temporal } from "temporal-polyfill";

export function isBetween(start: Temporal.PlainDate, end: Temporal.PlainDate, current: Temporal.PlainDate) {
  return Temporal.PlainDate.compare(current, start) >= 0 &&
    Temporal.PlainDate.compare(current, end)   <= 0
}