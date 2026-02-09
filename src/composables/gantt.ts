import { Temporal } from "temporal-polyfill";
import { Ref } from "vue";

import GanttTaskModal from "../components/GanttTaskModal.vue";
import { Task } from "../utils/types";

const overlay = useOverlay();
const modal = overlay.create(GanttTaskModal);

export function useGanttModal(task: Task) {
  async function openModal() {
    const instance = modal.open({ task: task });
    return await instance.result;
  }

  return {
    openModal,
  };
}

// New composable for editing tasks with automatic update
export function useTaskEditor(tasks: Ref<Task[]>) {
  async function editTask(id: number) {
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
