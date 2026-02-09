import { Task } from "../types";

const overlay = useOverlay();
const modal = overlay.create(() => import("../components/GanttTaskModal.vue"));

export function useGanttModal(task: Task) {
  async function openModal() {
    const instance = modal.open({ task: task });
    return await instance.result;
  }

  return {
    openModal,
  };
}
