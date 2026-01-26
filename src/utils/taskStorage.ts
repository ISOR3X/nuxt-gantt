import { Temporal } from "temporal-polyfill";
import { Task } from "./types";

// Serializable task type for JSON export
type SerializedTask = Omit<Task, "">

/**
 * Serialize tasks to JSON-compatible format
 */
export function serializeTasks(tasks: Task[]): SerializedTask[] {
  return tasks.map((task) => ({
    id: task.id,
    label: task.label,
    row: task.row,
    col: task.col,
    width: task.width,
    height: task.height
  }));
}

/**
 * Deserialize tasks from JSON format
 */
export function deserializeTasks(data: any[]): Task[] {
  return data.map((task) => ({
    id: task.id,
    label: task.label,
    row: task.row,
    col: task.col,
    width: task.width,
    height: task.height
  }));
}

/**
 * Save tasks to a JSON file and trigger download
 */
export function saveTasks(tasks: Task[]): void {
  try {
    const serializedTasks = serializeTasks(tasks);
    const json = JSON.stringify(serializedTasks, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `gantt-tasks-${Temporal.Now.plainDateISO().toString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error saving tasks:", error);
    throw new Error("Failed to save tasks. Please try again.");
  }
}

/**
 * Load tasks from a file
 * Returns a promise that resolves with the loaded tasks
 */
export function loadTasksFromFile(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
          throw new Error("Invalid file format: expected an array of tasks");
        }

        const loadedTasks = deserializeTasks(data);
        resolve(loadedTasks);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
