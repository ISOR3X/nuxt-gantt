import { Temporal } from "temporal-polyfill";

import { Event, Task } from "./gantt";

export interface Project {
  label?: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  tasks?: Task[];
  events?: Event[];
}
