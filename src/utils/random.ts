import { Temporal } from "temporal-polyfill";
import { Deadline, Task } from "./types";

type InBetween = number[] // [start, end]

// Random day within a specified range
export function randomDateBetween(
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): Temporal.PlainDate {
  const totalDays = startDate.until(endDate).days;
  const randomDays = Math.floor(Math.random() * totalDays);
  return startDate.add({ days: randomDays });
}

function randomIntBetween(inBetween: InBetween) {
  const diff = inBetween[1] - inBetween[0];
  return inBetween[0] +  Math.floor(Math.random() * diff);
}

// Generate a random task for a specific row (one task per row)
export function generateRandomTask(
  rowIndex: number,
  inBetween: InBetween,
  maxWidth: number = 10
): Task {
  return {
    id: rowIndex,
    row: rowIndex,
    col:randomIntBetween(inBetween),
    width:Math.floor(Math.random() * maxWidth) + 1,
    label: `Task ${rowIndex}`,
  };
}

// Generate tasks for all rows (one task per row)
export function generateRandomTasks(
  count: number,
  inBetween: InBetween
): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(generateRandomTask(i,inBetween));
  }
  return tasks;
}

// Helper function to create a random deadline line
export function generateRandomDeadline(inBetween: InBetween, id: number): Deadline {
  return {
    id: id,
    col: randomIntBetween(inBetween),
    label: "Deadline " + id,
  };
}

// Function to generate random deadlines spread throughout the chart
export function generateRandomDeadlines(
  count: number = 20,
  inBetween: InBetween,
): Deadline[] {
  const newDeadlines: Deadline[] = [];

  for (let i = 0; i < count; i++) {
    const deadline = generateRandomDeadline(inBetween, i);
    newDeadlines.push(deadline);
  }
  return newDeadlines;
}
