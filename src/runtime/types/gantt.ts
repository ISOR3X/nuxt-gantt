import { Temporal } from "temporal-polyfill";

export type TaskDependencyType = "FS" | "FF" | "SF" | "SS";

export interface TaskDependency {
  taskId: string;
  type: TaskDependencyType;
}

interface ChartObject {
  id: string;
  date: Temporal.PlainDate;
}

interface RangedChartObject extends Omit<ChartObject, "date"> {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
}

export interface Task {
  id: string;
  label: string;
  description?: string;
  // order: number, // Disabled to see if we really need it!

  startDate: Temporal.PlainDate;
  endDate?: Temporal.PlainDate; // If unset, we assume start == end

  type?: "task" | "milestone";

  dependencies?: TaskDependency[];

  progress?: number;
}

export interface Event extends RangedChartObject {
  label: string;
  description?: string;
}

export interface Deadline extends ChartObject {
  label: string;
}

export interface TaskWithGanttMeta extends Task {
  index: number;
  col: number;
  colSpan: number;
}
