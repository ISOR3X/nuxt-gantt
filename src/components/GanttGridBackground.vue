<script lang="ts" setup>
import { Temporal } from "temporal-polyfill";

import { useGanttContext } from "../composables/gantt.ts";
import { Deadline, Weekday } from "../types";

const props = defineProps<{
  startDate: Temporal.PlainDate;
  offDays: Weekday[];
  hideDaysOff: boolean;
  visibleDeadlines: (Deadline & { col: number })[];
}>();

const { cellSize, totalWidth, totalHeight } = useGanttContext();
</script>

<template>
  <svg
    class="pointer-events-none absolute inset-0 z-0 h-full w-full"
    :style="{
      minHeight: `${totalHeight}px`,
      minWidth: `${totalWidth}px`,
    }"
  >
    <defs>
      <pattern
        id="grid-pattern"
        :height="cellSize.y"
        :width="cellSize.x"
        patternUnits="userSpaceOnUse"
      >
        <rect :height="cellSize.y" :width="cellSize.x" fill="transparent" />
        <path
          :d="`M ${cellSize.x} 0 L ${cellSize.x} ${cellSize.y}`"
          fill="none"
          class="stroke-default"
          stroke-width="1"
        />
        <path
          :d="`M 0 ${cellSize.y} L ${cellSize.x} ${cellSize.y}`"
          fill="none"
          class="stroke-default"
          stroke-width="1"
        />
      </pattern>
    </defs>
    <rect fill="url(#grid-pattern)" height="100%" width="100%" />

    <!-- Off-day shading pattern (only when days-off are visible) -->
    <template v-if="!hideDaysOff && offDays.length > 0">
      <defs>
        <pattern
          id="off-days-pattern"
          :x="-(startDate.dayOfWeek - 1) * cellSize.x"
          :height="cellSize.y"
          :width="7 * cellSize.x"
          patternUnits="userSpaceOnUse"
        >
          <rect
            v-for="day in offDays"
            :key="day"
            :x="(day - 1) * cellSize.x"
            y="0"
            :width="cellSize.x"
            :height="cellSize.y"
            class="fill-default/20"
          />
        </pattern>
      </defs>
      <rect fill="url(#off-days-pattern)" height="100%" width="100%" />
    </template>

    <!-- Deadline vertical lines -->
    <g
      v-for="deadline in visibleDeadlines"
      :key="`line-${deadline.id}`"
      :transform="`translate(${deadline.col * cellSize.x}, 0)`"
    >
      <line
        y1="0"
        y2="100%"
        stroke-width="1"
        class="pointer-events-none"
        :class="[deadline.id === -1 ? 'stroke-error' : 'stroke-primary']"
      />
    </g>
  </svg>
</template>
