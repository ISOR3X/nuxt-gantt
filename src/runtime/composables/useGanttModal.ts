import { Ref } from "vue";

import TaskEditorModal from "../components/TaskEditorModal.vue";
import { Task } from "../types/gantt";

export function createTaskModal(taskMap: Ref<Map<string, Task>>) {
  const overlay = useOverlay();
  const modal = overlay.create(TaskEditorModal);

  return {
    open: async (task: Task) => {
      const instance = modal.open({
        item: task,
        itemMap: taskMap.value,
      });
      return await instance.result;
    },
  };
}
