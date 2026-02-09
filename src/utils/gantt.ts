import { Temporal } from "temporal-polyfill";

import { Task } from "../types";

export function cloneTask(task: Task): Task {
  return {
    ...task,
    startDate: Temporal.PlainDate.from(task.startDate.toString()),
    endDate: Temporal.PlainDate.from(task.endDate.toString()),
  };
}
