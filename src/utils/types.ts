import { Temporal } from "temporal-polyfill";

export type Task = {
  id: string;
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  progress?: number;
};

export type Goal = {
  id: string;
  label: string;
  date: Temporal.PlainDate;
};
