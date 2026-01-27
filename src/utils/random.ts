import { Temporal } from "temporal-polyfill";
import { Deadline, Task } from "./types";

// Generate a random task for a specific row (one task per row)
export function generateRandomTask(rowIndex: number, overscan: number = 5): Task {
  return {
    id: rowIndex,
    row: rowIndex,
    col: Math.floor(Math.random() * 50) + overscan, // Start between columns 5-55
    width: Math.floor(Math.random() * 15) + overscan, // Width between 5-20 cells
    label: `Task ${rowIndex}`,
  };
}

// Generate tasks for all rows (one task per row)
export function generateRandomTasks(count: number): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(generateRandomTask(i));
  }
  return tasks;
}

// Helper function to create a random deadline line
export function generateRandomDeadline(date: Temporal.PlainDate, id: number): Deadline {
  return {
    id: id,
    date,
    label: `Deadline ${date.toLocaleString("en", { month: "short", day: "numeric" })}`,
  };
}

// Function to generate random deadlines spread throughout the chart
export function generateRandomDeadlines(
  count: number = 20,
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): Deadline[] {
  const totalDays = startDate.until(endDate).days;
  const newDeadlines: Deadline[] = [];

  for (let i = 0; i < count; i++) {
    // Random day within the chart range
    const randomDays = Math.floor(Math.random() * totalDays);
    const randomDate = startDate.add({ days: randomDays });

    const deadline = generateRandomDeadline(randomDate, i);
    newDeadlines.push(deadline);
  }

  const todayDeadline: Deadline = {
    id: -1,
    date: Temporal.Now.plainDateISO(),
    label: "Today",
  };
  newDeadlines.push(todayDeadline);

  return newDeadlines;
}
