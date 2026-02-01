import { Temporal } from "temporal-polyfill";

export interface PersistedTask {
  id: number;
  label: string;
  progress: number;
  startDate: string;
  endDate: string;
}

export interface Task extends Omit<PersistedTask, "startDate" | "endDate"> {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  // Computed fields
  row: number; // What row the task is at. We can't use a simple index because visibleTasks doesn't always contain subsequent tasks.
  col: number; // Start column
  width: number; // Width
}

export interface PersistedDeadline {
  id: number;
  label?: string;
  date: string;
}

export interface Deadline extends Omit<PersistedDeadline, "date"> {
  date: Temporal.PlainDate;
  // Computed fields
  col: number; // Column
}

export interface PersistedProject {
  label: string;
  startDate: string;
  endDate: string;
  tasks: PersistedTask[];
  deadlines: PersistedDeadline[];
}

export interface Project extends Omit<
  PersistedProject,
  "startDate" | "endDate" | "tasks" | "deadlines"
> {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  tasks: Task[];
  deadlines: Deadline[];
}
