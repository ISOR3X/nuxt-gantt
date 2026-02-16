import TaskEditor from "../components/TaskEditor.vue";
import { Task } from "../types/gantt";

const overlay = useOverlay();
const modal = overlay.create(TaskEditor);

export function useGanttModal(task: Task) {
  async function openModal() {
    const instance = modal.open({ item: task });
    return await instance.result;
  }

  return {
    open: openModal,
  };
}
