import { Project, SerializedProject } from "./types";
import { colToDate, dateToCol } from "./temporal";
import { Temporal } from "temporal-polyfill";

export function serializeProject(project: Project): SerializedProject {
  return {
    startDate: project.startDate.toString(),
    endDate: project.endDate.toString(),
    tasks: project.tasks.map((task) => ({
      id: task.id,
      row: task.row,
      startDate: colToDate(project.startDate, task.col).toString(),
      endDate: colToDate(project.startDate, task.col + task.width).toString(),
      label: task.label,
    })),
    deadlines: project.deadlines.map((deadline) => ({
      id: deadline.id,
      date: colToDate(project.startDate, deadline.col).toString(),
      label: deadline.label,
    })),
  };
}

export function deserializeProject(serialized: SerializedProject): Project {
  const startDate = Temporal.PlainDate.from(serialized.startDate);
  const endDate = Temporal.PlainDate.from(serialized.endDate);

  return {
    startDate,
    endDate,
    tasks: serialized.tasks.map((task) => {
      const taskStartDate = Temporal.PlainDate.from(task.startDate);
      const taskEndDate = Temporal.PlainDate.from(task.endDate);

      return {
        id: task.id,
        row: task.row,
        col: dateToCol(startDate, taskStartDate),
        width: taskStartDate.until(taskEndDate).days,
        label: task.label,
      };
    }),
    deadlines: serialized.deadlines.map((deadline) => ({
      id: deadline.id,
      col: dateToCol(startDate, Temporal.PlainDate.from(deadline.date)),
      label: deadline.label,
    })),
  };
}

/**
 * Save project to a JSON file and trigger download
 */
export function saveProject(project: Project): void {
  try {
    const serialized = serializeProject(project);
    const json = JSON.stringify(serialized, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gantt-project-${Temporal.Now.plainDateISO().toString()}.json`;
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
 * Load project from a file
 * Returns a promise that resolves with the loaded project
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
