import { inject, InjectionKey, provide } from "vue";

import GanttTaskModal from "../components/GanttTaskModal.vue";
import { Task, Vec2 } from "../types";

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

// #region context
export interface GanttContext {
  cellSize: Vec2;
}

export const GANTT_CONTEXT_KEY: InjectionKey<GanttContext> = Symbol("gantt-context");

export function provideGanttContext(ctx: GanttContext) {
  provide(GANTT_CONTEXT_KEY, ctx);
}

export function useGanttContext(): GanttContext {
  const ctx = inject(GANTT_CONTEXT_KEY);
  if (!ctx) {
    throw new Error("useGanttContext() must be called inside a <GanttChart> component.");
  }
  return ctx;
}
// #endregion
