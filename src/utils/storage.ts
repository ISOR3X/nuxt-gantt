import { Temporal } from "temporal-polyfill";

import { dateToCol } from "./temporal";
import { Project, PersistedProject, TaskDependency, TaskDependencyType } from "./types";

/**
 * Parse a persisted dependency string (e.g. "11FS") into a TaskDependency object.
 * Format: <taskId><type> where type is one of FS, FF, SS, SF.
 */
export function parseDependencyString(dep: string): TaskDependency | null {
  const match = dep.match(/^(\d+)(FS|FF|SS|SF)$/);
  console.log(match);
  if (!match) return null;

  return {
    toId: parseInt(match[1], 10),
    type: match[2] as TaskDependencyType,
  };
}

/**
 * Serialize a TaskDependency to the persisted string format (e.g. "11FS").
 */
export function serializeDependency(dep: TaskDependency): string {
  return `${dep.toId}${dep.type}`;
}

/**
 * Serialize a Project to a PersistedProject.
 */
export function serializeProject(project: Project): PersistedProject {
  return {
    label: project.label,
    startDate: project.startDate.toString(),
    endDate: project.endDate.toString(),
    tasks: project.tasks.map((task) => ({
      id: task.id,
      label: task.label,
      progress: task.progress,
      startDate: task.startDate.toString(),
      endDate: task.endDate.toString(),
      dependencies: task.dependencies?.map(serializeDependency),
    })),
    deadlines: project.deadlines.map((deadline) => ({
      id: deadline.id,
      date: deadline.date.toString(),
      label: deadline.label,
    })),
  };
}

/**
 * Desarialize a PersistedProject (usually parsed straight from JSON) to a Project.
 */
export function deserializeProject(persisted: PersistedProject): Project {
  const startDate = Temporal.PlainDate.from(persisted.startDate);
  const endDate = Temporal.PlainDate.from(persisted.endDate);

  return {
    label: persisted.label,
    startDate,
    endDate,
    tasks: persisted.tasks.map((s_task, index) => {
      const _startDate = Temporal.PlainDate.from(s_task.startDate);
      const _endDate = Temporal.PlainDate.from(s_task.endDate);
      // Parse persisted dependency strings (e.g. "11FS") into TaskDependency objects
      const dependencies = s_task.dependencies
        ?.map(parseDependencyString)
        .filter((d) => d !== null);

      return {
        id: s_task.id,
        label: s_task.label,
        progress: s_task.progress,
        startDate: _startDate,
        endDate: _endDate,
        // Computed fields
        row: index,
        col: dateToCol(startDate, _startDate),
        width: _startDate.until(_endDate).days,
        dependencies: dependencies && dependencies.length > 0 ? dependencies : undefined,
      };
    }),
    deadlines: persisted.deadlines.map((deadline) => {
      const deadlineDate = Temporal.PlainDate.from(deadline.date);
      return {
        id: deadline.id,
        label: deadline.label,
        date: deadlineDate,
        // Computed fields
        col: dateToCol(startDate, deadlineDate),
      };
    }),
  };
}

/**
 * Save project to a JSON file and trigger download.
 */
export function saveProject(project: Project): void {
  try {
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
        if (
          !data.startDate ||
          !data.endDate ||
          !Array.isArray(data.tasks) ||
          !Array.isArray(data.deadlines)
        ) {
          throw new Error("Invalid file format: missing required project fields");
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
