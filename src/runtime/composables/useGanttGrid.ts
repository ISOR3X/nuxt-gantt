import { useElementSize } from "@vueuse/core";
import defu from "defu";
import { computed, Ref, ShallowRef } from "vue";

import { ScrollMouseInElementOptions, useScrollMouseInElement } from "./useScrollMouseInElement";

export interface GanttGridOptions extends ScrollMouseInElementOptions {
  cellSize: Ref<{
    width: number;
    height: number;
  }>;
}

export function useGanttGrid(
  target: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>,
  options: GanttGridOptions,
) {
  const _options = defu(options, { offset: { x: 0, y: 0 } });

  const { width: viewportWidth, height: viewportHeight } = useElementSize(target);
  const { hovered, scrolled } = useScrollMouseInElement(target, {
    offset: { x: _options.offset.x, y: _options.offset.y },
  });

  const hoveredCell = computed(() => {
    if (hovered.x.value != null && hovered.y.value != null) {
      return {
        col: Math.floor(hovered.x.value / options.cellSize.value.width),
        row: Math.floor(hovered.y.value / options.cellSize.value.height),
      };
    }
  });

  const rowsOnScreen = computed(() => {
    return {
      min: Math.floor(scrolled.y.value / options.cellSize.value.height),
      // -1 because we want index based rows.
      max:
        Math.ceil(
          (scrolled.y.value + viewportHeight.value - _options.offset.y) /
            options.cellSize.value.height,
        ) - 1,
    };
  });

  const colsOnScreen = computed(() => {
    return {
      min: Math.floor(scrolled.x.value / options.cellSize.value.width),
      // -1 because we want index based cols.
      max:
        Math.ceil(
          (scrolled.x.value + viewportWidth.value - _options.offset.x) /
            options.cellSize.value.width,
        ) - 1,
    };
  });

  const viewport = computed(() => ({
    left: scrolled.x.value,
    top: scrolled.y.value,
    right: scrolled.x.value + viewportWidth.value,
    bottom: scrolled.y.value + viewportHeight.value,
    width: viewportWidth,
    height: viewportHeight,
  }));

  return { hoveredCell, rowsOnScreen, colsOnScreen, scrollTo, viewport };
}
