export interface Vec2 {
  x: number;
  y: number;
}

export const WEEKDAYS = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
} as const;

export type Weekday = keyof typeof WEEKDAYS;
export type WeekdayName = (typeof WEEKDAYS)[Weekday];
