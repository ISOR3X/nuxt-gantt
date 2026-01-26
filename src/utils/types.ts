import { Temporal } from "temporal-polyfill";

export type _Task = {
  id: string;
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  progress?: number;
};

// Task interface
export interface Task {
  id: number;
  row: number;
  col: number;
  width: number;
  height: number;
  label: string;
}

export type Goal = {
  id: string;
  label: string;
  date: Temporal.PlainDate;
};
