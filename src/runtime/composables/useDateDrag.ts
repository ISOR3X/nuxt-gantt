import { Temporal } from "temporal-polyfill";
import { ref, computed, type Ref } from "vue";

export type DragMode = "none" | "dragging" | "resizing-left" | "resizing-right";

export interface DragOptions {
  cellSize: Ref<{ width: number; height: number }>;
  readOnly?: Ref<boolean>;
  onDragStart?: (mode: DragMode) => void;
  onDragEnd?: () => void;
}

export interface DragHandlers {
  onMouseDownBar: (e: MouseEvent) => void;
  onMouseDownLeft: (e: MouseEvent) => void;
  onMouseDownRight: (e: MouseEvent) => void;
}

export interface DateDragState {
  dragMode: Ref<DragMode>;
  isDragging: Ref<boolean>;
  isResizingLeft: Ref<boolean>;
  isResizingRight: Ref<boolean>;
  cursorStyle: Ref<string>;
}

export function useDateDragging<
  T extends {
    startDate: Temporal.PlainDate;
    endDate?: Temporal.PlainDate;
  },
>(item: Ref<T | undefined>, options: DragOptions): DragHandlers & DateDragState {
  const { cellSize, readOnly, onDragStart, onDragEnd } = options;

  const dragMode = ref<DragMode>("none");
  const isDragging = computed(() => dragMode.value === "dragging");
  const isResizingLeft = computed(() => dragMode.value === "resizing-left");
  const isResizingRight = computed(() => dragMode.value === "resizing-right");

  const dragStartX = ref(0);
  const originalStartDate = ref<Temporal.PlainDate | undefined>(undefined);
  const originalEndDate = ref<Temporal.PlainDate | undefined>(undefined);

  const cursorStyle = computed(() => {
    if (readOnly?.value) return "";
    if (isDragging.value) return "cursor-grabbing";
    if (isResizingLeft.value || isResizingRight.value) return "cursor-ew-resize";
    return "cursor-grab";
  });

  function startDrag(e: MouseEvent, mode: DragMode) {
    if (readOnly?.value) return;

    e.stopPropagation();
    dragMode.value = mode;
    dragStartX.value = e.clientX;

    if (item.value) {
      originalStartDate.value = item.value.startDate;
      originalEndDate.value = item.value.endDate;
    }

    onDragStart?.(mode);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!originalStartDate.value || !item.value || readOnly?.value) return;

    const deltaX = e.clientX - dragStartX.value;
    const daysMoved = Math.round(deltaX / cellSize.value.width);

    let newStartDate = originalStartDate.value;
    let newEndDate = originalEndDate.value;
    const pseudoEndDate = originalEndDate.value ?? originalStartDate.value;

    if (isDragging.value) {
      newStartDate = originalStartDate.value.add({ days: daysMoved });
      if (originalEndDate.value) {
        newEndDate = originalEndDate.value.add({ days: daysMoved });
      }
    } else if (isResizingLeft.value) {
      newStartDate = originalStartDate.value.add({ days: daysMoved });
      if (newEndDate == undefined) {
        newEndDate = originalStartDate.value;
      }
      if (Temporal.PlainDate.compare(newStartDate, pseudoEndDate) > 0) {
        return; // Don't update if invalid
      }
    } else if (isResizingRight.value) {
      newEndDate = pseudoEndDate.add({ days: daysMoved });
      if (Temporal.PlainDate.compare(newEndDate, originalStartDate.value) < 0) {
        return; // Don't update if invalid
      }
    }

    item.value.startDate = newStartDate;
    item.value.endDate = newEndDate;
  }

  function onMouseUp() {
    dragMode.value = "none";
    originalStartDate.value = undefined;
    originalEndDate.value = undefined;

    onDragEnd?.();

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  function onMouseDownBar(e: MouseEvent) {
    if (dragMode.value !== "none") return;
    startDrag(e, "dragging");
  }

  function onMouseDownLeft(e: MouseEvent) {
    startDrag(e, "resizing-left");
  }

  function onMouseDownRight(e: MouseEvent) {
    startDrag(e, "resizing-right");
  }

  return {
    // Handlers
    onMouseDownBar,
    onMouseDownLeft,
    onMouseDownRight,
    // State
    dragMode,
    isDragging,
    isResizingLeft,
    isResizingRight,
    cursorStyle,
  };
}
