import { Temporal } from "temporal-polyfill";

import { Project } from "../types/common";
import { Task, Event, TaskDependency, TaskDependencyType } from "../types/gantt";
import { SerializedEvent, SerializedProject, SerializedTask } from "../types/storage";

/**
 * Parse a persisted dependency string (any string ending with <type>)
 * into a TaskDependency object.
 * Format: <taskId><type> where type is one of FS, FF, SS, SF.
 */
export function parseDependencyString(dep: string): TaskDependency | null {
  if (dep.length < 3) return null;

  const type = dep.slice(-2);
  const validTypes = ["FS", "FF", "SS", "SF"];

  if (!validTypes.includes(type)) return null;

  const taskId = dep.slice(0, -2);

  return {
    taskId,
    type: type as TaskDependencyType,
  };
}

/**
 * Serialize a TaskDependency to the persisted string format (e.g. "11FS").
 */
export function serializeDependency(dep: TaskDependency): string {
  return `${dep.taskId}${dep.type}`;
}

/**
 * Serialize a Project to a SerializedProject.
 */
export function serializeProject(project: Project): SerializedProject {
  let serializedTasks: SerializedTask[] = [];
  let serializedEvents: SerializedEvent[] = [];

  if (project.tasks) {
    serializedTasks = project.tasks.map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
      type: t.type,
      color: t.color,
      progress: t.progress,
      startDate: t.startDate.toString(),
      endDate: t.endDate?.toString(),
      dependencies: t.dependencies?.map(serializeDependency),
    }));
  }

  if (project.events) {
    serializedEvents = project.events.map((e) => ({
      id: e.id,
      label: e.label,
      description: e.description,
      type: e.type,
      color: e.color,
      startDate: e.startDate.toString(),
      endDate: e.endDate?.toString(),
    }));
  }

  return {
    label: project.label,
    startDate: project.startDate.toString(),
    endDate: project.endDate.toString(),
    tasks: serializedTasks,
    events: serializedEvents,
  };
}

/**
 * Desarialize a SerializedProject (usually parsed straight from JSON) to a Project.
 */
export function deserializeProject(persisted: SerializedProject): Project {
  const startDate = Temporal.PlainDate.from(persisted.startDate);
  const endDate = Temporal.PlainDate.from(persisted.endDate);

  let tasks: Task[] | undefined = undefined;
  let events: Event[] | undefined = undefined;

  if (persisted.tasks) {
    tasks = persisted.tasks.map((t) => {
      const _startDate = Temporal.PlainDate.from(t.startDate);
      const _endDate = t.endDate ? Temporal.PlainDate.from(t.endDate) : undefined;

      // Parse persisted dependency strings (e.g. "11FS") into TaskDependency objects
      const dependencies = t.dependencies?.map(parseDependencyString).filter((d) => d !== null);

      return {
        id: t.id,
        label: t.label,
        description: t.description,
        type: t.type,
        color: t.color,
        progress: t.progress,
        startDate: _startDate,
        endDate: _endDate,
        dependencies: dependencies && dependencies.length > 0 ? dependencies : undefined,
      };
    });
  }

  if (persisted.events) {
    events = persisted.events.map((e) => {
      const _startDate = Temporal.PlainDate.from(e.startDate);
      const _endDate = e.endDate ? Temporal.PlainDate.from(e.endDate) : undefined;

      return {
        id: e.id,
        label: e.label,
        description: e.description,
        type: e.type,
        color: e.color,
        startDate: _startDate,
        endDate: _endDate,
      };
    });
  }

  return {
    label: persisted.label,
    startDate,
    endDate,
    tasks: tasks,
    events: events,
  };
}

/**
 * Save project to a JSON file and trigger download.
 */
export function saveProject(project: Project): void {
  try {
    project.label = project.label || "nuxt-gantt";
    const persisted = serializeProject(project);
    const json = JSON.stringify(persisted, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.label}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error saving project:", error);
    throw new Error("Failed to save project. Please try again.");
  }
}

/**
 * Load project from a file.
 * @returns A promise that resolves with the loaded project
 */
export function loadProjectFromFile(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data || typeof data !== "object") {
          throw new Error("Invalid file format: expected a project object");
        }
        const project = deserializeProject(data);
        resolve(project);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
