import { Task } from "./types";

// Generate a random task for a specific row (one task per row)
export function generateRandomTask(
  rowIndex: number,
  overscan: number = 5,
): Task {
  return {
    id: rowIndex,
    row: rowIndex,
    col: Math.floor(Math.random() * 50) + overscan, // Start between columns 5-55
    width: Math.floor(Math.random() * 15) + overscan, // Width between 5-20 cells
    height: 1, // One row height (standard Gantt task)
    label: `Task ${rowIndex}`,
  };
}

// Generate tasks for all rows (one task per row)
export function generateAllTasks(count: number): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(generateRandomTask(i));
  }
  return tasks;
}
