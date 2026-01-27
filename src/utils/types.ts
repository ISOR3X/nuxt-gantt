import { Temporal } from "temporal-polyfill";

export type _Task = {
  id: string;
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  progress?: number;
};

export interface Project {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  tasks: Task[];
}

export interface Task {
  id: number;
  row: number;
  col: number;
  width: number;
  height: number;
  label: string;
}

export interface Deadline {
  id: number;
  date: Temporal.PlainDate;
  label?: string;
}
