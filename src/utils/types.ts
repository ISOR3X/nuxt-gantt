import { Temporal } from "temporal-polyfill";

export interface Project {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  tasks: Task[];
  deadlines: Deadline[];
}

export interface Task {
  id: number;
  row: number;
  col: number;
  width: number;
  label: string;
}

export interface Deadline {
  id: number;
  col: number;
  label?: string;
}

export interface SerializedProject {
  startDate: string;
  endDate: string;
  tasks: SerializedTask[];
  deadlines: SerializedDeadline[];
}

export interface SerializedTask {
  id: number;
  row: number;
  startDate: string;
  endDate: string;
  label: string;
}

export interface SerializedDeadline {
  id: number;
  date: string;
  label?: string;
}
