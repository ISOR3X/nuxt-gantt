import { useMouseInElement, useScroll } from "@vueuse/core";
import defu from "defu";
import { computed, ShallowRef } from "vue";

export interface ScrollMouseInElementOptions {
  offset?: {
    x?: number;
    y?: number;
  };
}

export function useScrollMouseInElement(
  target: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>,
  options: ScrollMouseInElementOptions = {},
) {
  const _options = defu(options, { offset: { x: 0, y: 0 } });
  const { x: scrolledX, y: scrolledY } = useScroll(target);
  const {
    elementX: mouseX,
    elementY: mouseY,
    isOutside,
  } = useMouseInElement(target, { handleOutside: false });

  const x = computed(() => {
    if (isOutside.value) {
      return null;
    }
    return scrolledX.value + mouseX.value - _options.offset.x;
  });
  const y = computed(() => {
    if (isOutside.value) {
      return null;
    }
    return scrolledY.value + mouseY.value - _options.offset.y;
  });

  return { hovered: { x, y }, scrolled: { x: scrolledX, y: scrolledY } };
}
