import { Temporal } from "temporal-polyfill";

import { Color } from "../utils/common";

export type TaskDependencyType = "FS" | "FF" | "SF" | "SS";

export interface TaskDependency {
  taskId: string;
  type: TaskDependencyType;
}

export interface Task {
  id: string;
  label: string;
  description?: string;
  color?: Color;
  // order: number, // Disabled to see if we really need it!

  startDate: Temporal.PlainDate;
  endDate?: Temporal.PlainDate; // If unset, we assume start == end

  type?: "task" | "milestone";

  dependencies?: TaskDependency[];

  progress?: number;
}

export interface Event extends Omit<Task, "type" | "dependencies" | "progress"> {
  type?: "event" | "deadline";
}

interface GanttMeta {
  index: number;
  col: number;
  colSpan: number;
}

export type TaskWithGanttMeta = Task & GanttMeta;
export type EventWithGanttMeta = Event & GanttMeta;
