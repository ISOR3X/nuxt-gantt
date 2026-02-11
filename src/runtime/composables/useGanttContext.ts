import { inject, InjectionKey, provide, Ref } from "vue";

export interface GanttContext {
  cellSize: Ref<{ width: number; height: number }>;
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
