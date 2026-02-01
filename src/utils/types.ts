import { Temporal } from "temporal-polyfill";

export interface Project {
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  tasks: Task[];
  deadlines: Deadline[];
}

export interface Task {
  id: number;
  label: string;
  row: number; // What row
  col: number; // Start column
  width: number; // Width
  progress: number;
}

export interface Deadline {
  id: number;
  label?: string;
  col: number; // Column
}

export interface SerializedProject {
  label: string;
  startDate: string;
  endDate: string;
  tasks: SerializedTask[];
  deadlines: SerializedDeadline[];
}

export interface SerializedTask {
  id: number;
  label: string;
  row: number;
  startDate: string;
  endDate: string;
  progress: number;
}

export interface SerializedDeadline {
  id: number;
  date: string;
  label?: string;
}
