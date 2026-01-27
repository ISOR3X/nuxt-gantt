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
  date: Temporal.PlainDate;
  label?: string;
}
