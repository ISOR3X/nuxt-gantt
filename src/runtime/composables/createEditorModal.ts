import { Ref } from "vue";

import EventEditorModal from "../components/EventEditorModal.vue";
import TaskEditorModal from "../components/TaskEditorModal.vue";
import { Event, Task } from "../types/gantt";

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

export function createEventModal() {
  const overlay = useOverlay();
  const modal = overlay.create(EventEditorModal);

  return {
    open: async (event: Event) => {
      const instance = modal.open({
        item: event,
      });
      return await instance.result;
    },
  };
}
