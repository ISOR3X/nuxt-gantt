import { Temporal } from "temporal-polyfill";

import { Deadline, Task } from "./types";

type DateRange = [Temporal.PlainDate, Temporal.PlainDate]; // [start, end]

// Random day within a specified range
export function randomDateBetween(
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): Temporal.PlainDate {
  const totalDays = startDate.until(endDate).days;
  const randomDays = Math.floor(Math.random() * totalDays);
  return startDate.add({ days: randomDays });
}

function randomIntBetween(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

// Generate a random task for a specific row (one task per row)
export function generateRandomTask(
  rowIndex: number,
  dateRange: DateRange,
  maxDurationDays: number = 10,
): Task {
  const [rangeStart, rangeEnd] = dateRange;

  // Generate random start date within the range
  const startDate = randomDateBetween(rangeStart, rangeEnd);

  // Generate random duration (1 to maxDurationDays)
  const duration = randomIntBetween(1, maxDurationDays + 1);
  let endDate = startDate.add({ days: duration });

  if (Temporal.PlainDate.compare(endDate, rangeEnd) > 0) {
    endDate = rangeEnd;
  }

  return {
    id: rowIndex,
    row: rowIndex,
    label: `Task ${rowIndex}`,
    progress: Math.random(),
    startDate,
    endDate,
  };
}

export function generateRandomTasks(
  count: number,
  dateRange: DateRange,
  maxDurationDays: number = 10,
): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(generateRandomTask(i, dateRange, maxDurationDays));
  }
  return tasks;
}

export function generateRandomDeadline(
  dateRange: DateRange,
  chartStartDate: Temporal.PlainDate,
  id: number,
): Deadline {
  const [rangeStart, rangeEnd] = dateRange;
  const deadlineDate = randomDateBetween(rangeStart, rangeEnd);

  return {
    id,
    col: chartStartDate.until(deadlineDate).days,
    date: deadlineDate,
    label: `Deadline ${id}`,
  };
}

export function generateRandomDeadlines(
  count: number,
  dateRange: DateRange,
  chartStartDate: Temporal.PlainDate,
): Deadline[] {
  const deadlines: Deadline[] = [];
  for (let i = 0; i < count; i++) {
    deadlines.push(generateRandomDeadline(dateRange, chartStartDate, i));
  }
  return deadlines;
}
