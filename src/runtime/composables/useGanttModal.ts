import TaskEditorModal from "../components/TaskEditorModal.vue";
import { Task } from "../types/gantt";

const overlay = useOverlay();
const modal = overlay.create(TaskEditorModal);

export function useGanttModal(task: Task) {
  async function openModal() {
    const instance = modal.open({ item: task });
    return await instance.result;
  }

  return {
    open: openModal,
  };
}
