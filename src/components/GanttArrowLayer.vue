<script lang="ts" setup>
import { useGanttContext } from "../composables/gantt.ts";
import type { GanttArrow } from "../utils/arrows.ts";

defineProps<{
  visibleArrows: GanttArrow[];
}>();

const { totalWidth, totalHeight } = useGanttContext();
</script>

<template>
  <svg
    class="pointer-events-none absolute inset-0 z-10 h-full w-full"
    :style="{
      minHeight: `${totalHeight}px`,
      minWidth: `${totalWidth}px`,
    }"
  >
    <defs>
      <marker
        id="arrowhead"
        markerWidth="8"
        markerHeight="10"
        refX="4.5"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M 0 0 L 5 5 L 0 10 Z" class="fill-(--ui-border-accented)" />
      </marker>
    </defs>
    <path
      v-for="arrow in visibleArrows"
      :key="`${arrow.fromTaskId}-${arrow.toTaskId}-${arrow.type}`"
      :d="arrow.path"
      fill="none"
      class="stroke-(--ui-border-accented)"
      stroke-width="1.5"
      marker-end="url(#arrowhead)"
    />
  </svg>
</template>
