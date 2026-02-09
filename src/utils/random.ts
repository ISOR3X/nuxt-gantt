import { Temporal } from "temporal-polyfill";

import { Deadline, Task, TaskDependency, TaskDependencyType } from "../types";

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

const DEPENDENCY_TYPES: TaskDependencyType[] = ["FS"];

/**
 * Generate random dependencies for a task.
 * Roughly 30% of tasks get 1-2 dependencies pointing to nearby tasks.
 * Only creates dependencies to tasks with a lower index to avoid circular refs.
 */
function generateRandomDependencies(
  taskIndex: number,
  dependencyChance: number = 0.1,
  maxLookback: number = 10,
): TaskDependency[] | undefined {
  if (taskIndex === 0 || Math.random() > dependencyChance) return undefined;

  const depCount = randomIntBetween(1, 3); // 1 or 2 dependencies
  const deps: TaskDependency[] = [];
  const usedIds = new Set<number>();

  for (let d = 0; d < depCount; d++) {
    // Pick a random task from the nearby preceding tasks
    const lookback = Math.min(maxLookback, taskIndex);
    const targetIndex = taskIndex - randomIntBetween(1, lookback + 1);

    if (targetIndex < 0 || usedIds.has(targetIndex)) continue;
    usedIds.add(targetIndex);

    // Mostly FS dependencies (70%), rest are random types
    const type =
      Math.random() < 0.7 ? "FS" : DEPENDENCY_TYPES[randomIntBetween(0, DEPENDENCY_TYPES.length)];

    deps.push({ toId: targetIndex, type });
  }

  return deps.length > 0 ? deps : undefined;
}

export function generateRandomTasks(
  count: number,
  dateRange: DateRange,
  maxDurationDays: number = 10,
): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const task = generateRandomTask(i, dateRange, maxDurationDays);
    task.dependencies = generateRandomDependencies(i);
    tasks.push(task);
  }
  return tasks;
}

export function generateRandomDeadline(dateRange: DateRange, id: number): Deadline {
  const [rangeStart, rangeEnd] = dateRange;
  const deadlineDate = randomDateBetween(rangeStart, rangeEnd);

  return {
    id,
    date: deadlineDate,
    label: `Deadline ${id}`,
  };
}

export function generateRandomDeadlines(count: number, dateRange: DateRange): Deadline[] {
  const deadlines: Deadline[] = [];
  for (let i = 0; i < count; i++) {
    deadlines.push(generateRandomDeadline(dateRange, i));
  }
  return deadlines;
}
