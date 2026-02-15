import { Project } from "./common";
import { Event, Task } from "./gantt";

type OmitDates<T> = Omit<T, "startDate" | "endDate"> & {
  startDate: string;
  endDate?: string;
};

export type SerializedEvent = OmitDates<Event>;
export interface SerializedTask extends Omit<OmitDates<Task>, "dependencies"> {
  dependencies?: string[];
}

export interface SerializedProject extends Omit<
  Project,
  "tasks" | "events" | "startDate" | "endDate"
> {
  startDate: string;
  endDate: string;
  tasks?: SerializedTask[];
  events?: SerializedEvent[];
}
