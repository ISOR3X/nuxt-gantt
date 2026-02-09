import { Temporal } from "temporal-polyfill";

// Finish to start, finish to finish, start to finish and start to start.
export type TaskDependencyType = "FS" | "FF" | "SF" | "SS";

export interface TaskDependency {
  toId: number;
  type: TaskDependencyType;
}

export interface PersistedTask {
  id: number;
  label: string;
  progress: number;
  startDate: string;
  endDate: string;
  dependencies?: string[];
}

export interface Task extends Omit<PersistedTask, "startDate" | "endDate" | "dependencies"> {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  // Computed fields
  // TODO: Rename to outline or something similar to better state where it's used.
  row: number; // What row the task is at. We can't use a simple index because visibleTasks doesn't always contain subsequent tasks.
  dependencies?: TaskDependency[];
}

export interface PersistedDeadline {
  id: number;
  label?: string;
  date: string;
}

export interface Deadline extends Omit<PersistedDeadline, "date"> {
  date: Temporal.PlainDate;
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

export interface Vec2 {
  x: number;
  y: number;
}
