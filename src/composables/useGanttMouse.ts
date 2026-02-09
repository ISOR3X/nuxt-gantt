import { computed, ref, Ref } from "vue";

import { Vec2 } from "../types";

export function useGanttMouse(
  containerRef: Ref<HTMLElement | null>,
  scrollLeft: Ref<number>,
  scrollTop: Ref<number>,
  cellSize: Vec2,
  headerWidth: number,
  headerHeight: number,
) {
  const mousePos = ref<Vec2 | null>(null);

  const hoveredCell = computed(() => {
    if (!mousePos.value) return undefined;

    const relativeX = mousePos.value.x + scrollLeft.value - headerWidth;
    const col = Math.floor(relativeX / cellSize.x);

    const relativeY = mousePos.value.y + scrollTop.value - headerHeight;
    const row = Math.floor(relativeY / cellSize.y);

    return { col, row };
  });

  function handleMouseMove(event: MouseEvent) {
    const rect = containerRef.value?.getBoundingClientRect();
    if (!rect) return;
    mousePos.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handleMouseLeave() {
    mousePos.value = null;
  }

  return {
    hoveredCell,
    handleMouseMove,
    handleMouseLeave,
  };
}
