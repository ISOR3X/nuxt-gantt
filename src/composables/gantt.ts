import { Temporal } from "temporal-polyfill";
import { Ref } from "vue";

import GanttTaskModal from "../components/GanttTaskModal.vue";
import { Task } from "../utils/types";

const overlay = useOverlay();
const modal = overlay.create(GanttTaskModal);

function cloneTask(task: Task): Task {
  return {
    ...task,
    startDate: Temporal.PlainDate.from(task.startDate.toString()),
    endDate: Temporal.PlainDate.from(task.endDate.toString()),
  };
}

export function useGanttModal(task: Task) {
  async function openModal() {
    const copy = cloneTask(task);
    const instance = modal.open({ task: copy });
    const result = await instance.result;

    // Ensure dates are PlainDate objects when modal returns
    if (result && typeof result.startDate === "string") {
      result.startDate = Temporal.PlainDate.from(result.startDate);
    }
    if (result && typeof result.endDate === "string") {
      result.endDate = Temporal.PlainDate.from(result.endDate);
    }

    return result;
  }

  return {
    openModal,
  };
}

// New composable for editing tasks with automatic update
export function useTaskEditor(tasks: Ref<Task[]>) {
  async function editTask(taskOrId: Task | number) {
    const id = typeof taskOrId === "number" ? taskOrId : taskOrId.id;
    const idx = tasks.value.findIndex((t) => t.id === id);
    const task = tasks.value[idx];

    if (idx === -1 || !task) return null;

    const { openModal } = useGanttModal(task);
    const updatedTask = await openModal();

    if (updatedTask != null) {
      tasks.value[idx] = updatedTask;
    }

    return updatedTask;
  }

  return {
    editTask,
  };
}
