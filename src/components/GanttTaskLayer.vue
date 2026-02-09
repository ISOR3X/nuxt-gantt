<script lang="ts" setup>
import { Temporal } from "temporal-polyfill";

import { useGanttContext } from "../composables/gantt.ts";
import { Task } from "../types";
import GanttBar from "./GanttBar.vue";

type CellHighlight = { row: boolean; col: boolean };

defineProps<{
  visibleTasks: (Task & { col: number; width: number })[];
  hoveredCell: { col: number; row: number } | undefined;
  cellHighlight: CellHighlight;
}>();

const emit = defineEmits<{
  updateDates: [taskId: number, startDate: Temporal.PlainDate, endDate: Temporal.PlainDate];
  taskClick: [taskId: number];
}>();

const { cellSize } = useGanttContext();
</script>

<template>
  <div class="pointer-events-none absolute z-20">
    <GanttBar
      v-for="task in visibleTasks"
      :key="task.id"
      class="pointer-events-auto absolute z-20"
      :style="{
        left: `${task.col * cellSize.x}px`,
        top: `${task.row * cellSize.y}px`,
        width: `${task.width * cellSize.x}px`,
        height: `${cellSize.y}px`,
      }"
      :pixels-width="cellSize.x"
      :task="task"
      @update-dates="({ startDate, endDate }) => emit('updateDates', task.id, startDate, endDate)"
      @popover-clicked="({ taskId }) => emit('taskClick', taskId)"
    />

    <!-- Cell highlight -->
    <div
      v-if="hoveredCell && cellHighlight.col"
      class="pointer-events-auto absolute z-0 h-full bg-accented/10"
      :style="{
        left: `${hoveredCell.col * cellSize.x}px`,
        width: `${cellSize.x}px`,
      }"
    />
    <div
      v-if="hoveredCell && cellHighlight.row"
      class="pointer-events-auto absolute z-0 w-full bg-accented/10"
      :style="{
        top: `${hoveredCell.row * cellSize.y}px`,
        height: `${cellSize.y}px`,
      }"
    />
  </div>
</template>
